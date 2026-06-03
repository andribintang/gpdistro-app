"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { ADMIN_COOKIE, ADMIN_TOKEN, ADMIN_PASSWORD } from "@/lib/auth";
import { applyOrderStatus } from "@/lib/orders";

export type SizeInput = { label: string; stock: number };
export type ImageInput = { url: string; alt: string };
export type ProductInput = {
  name: string;
  slug: string;
  categoryId: string;
  basePrice: number;
  costPrice: number;
  oldPrice: number | null;
  material: string;
  fit: string;
  weightGram: number;
  emoji: string;
  description: string;
  isBestSeller: boolean;
  isNew: boolean;
  isActive: boolean;
  sizes: SizeInput[];
  images: ImageInput[];
};

const slugify = (s: string) =>
  s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

// ---------- AUTH ----------
export async function login(formData: FormData) {
  const pw = String(formData.get("password") ?? "");
  if (pw !== ADMIN_PASSWORD) {
    redirect("/admin/login?error=1");
  }
  cookies().set(ADMIN_COOKIE, ADMIN_TOKEN, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 hari
  });
  redirect("/admin");
}

export async function logout() {
  cookies().delete(ADMIN_COOKIE);
  redirect("/admin/login");
}

// ---------- PRODUCTS ----------
export async function createProduct(data: ProductInput) {
  const slug = data.slug ? slugify(data.slug) : slugify(data.name);
  await prisma.product.create({
    data: {
      slug, name: data.name, description: data.description, emoji: data.emoji || "👕",
      basePrice: data.basePrice, costPrice: data.costPrice, oldPrice: data.oldPrice,
      material: data.material, fit: data.fit, weightGram: data.weightGram,
      isBestSeller: data.isBestSeller, isNew: data.isNew, isActive: data.isActive,
      categoryId: data.categoryId,
      sizes: { create: data.sizes.map((s, i) => ({ label: s.label, stock: s.stock, order: i })) },
      images: { create: data.images.map((im, i) => ({ url: im.url, alt: im.alt || data.name, order: i })) },
    },
  });
  revalidatePath("/admin/products");
  revalidatePath("/");
  redirect("/admin/products");
}

export async function updateProduct(id: string, data: ProductInput) {
  const slug = data.slug ? slugify(data.slug) : slugify(data.name);
  // ganti set ukuran: hapus lama, buat baru (sederhana & aman untuk admin tool)
  await prisma.productSize.deleteMany({ where: { productId: id } });
  await prisma.productImage.deleteMany({ where: { productId: id } });
  await prisma.product.update({
    where: { id },
    data: {
      slug, name: data.name, description: data.description, emoji: data.emoji || "👕",
      basePrice: data.basePrice, costPrice: data.costPrice, oldPrice: data.oldPrice,
      material: data.material, fit: data.fit, weightGram: data.weightGram,
      isBestSeller: data.isBestSeller, isNew: data.isNew, isActive: data.isActive,
      categoryId: data.categoryId,
      sizes: { create: data.sizes.map((s, i) => ({ label: s.label, stock: s.stock, order: i })) },
      images: { create: data.images.map((im, i) => ({ url: im.url, alt: im.alt || data.name, order: i })) },
    },
  });
  revalidatePath("/admin/products");
  revalidatePath("/");
  redirect("/admin/products");
}

export async function deleteProduct(id: string) {
  // amankan: jangan hapus jika sudah ada di order; nonaktifkan saja
  const used = await prisma.orderItem.count({ where: { productId: id } });
  if (used > 0) {
    await prisma.product.update({ where: { id }, data: { isActive: false } });
  } else {
    await prisma.productSize.deleteMany({ where: { productId: id } });
    await prisma.product.delete({ where: { id } });
  }
  revalidatePath("/admin/products");
  revalidatePath("/");
}

// ---------- ORDERS ----------
export async function setOrderStatus(id: string, status: string) {
  await prisma.order.update({ where: { id }, data: { status } });
  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${id}`);
}

// Terima pembayaran manual (PENDING -> PAID)
export async function confirmPayment(id: string) {
  const order = await prisma.order.findUnique({ where: { id } });
  if (!order || order.status !== "PENDING") return;
  await prisma.order.update({ where: { id }, data: { status: "PAID", paidAt: new Date() } });
  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${id}`);
}

// Proses pengiriman + input resi (PAID -> SHIPPED)
export async function shipOrder(id: string, formData: FormData) {
  const trackingNumber = String(formData.get("trackingNumber") ?? "").trim();
  if (!trackingNumber) return;
  const order = await prisma.order.findUnique({ where: { id } });
  if (!order || order.status !== "PAID") return;
  await prisma.order.update({
    where: { id },
    data: { status: "SHIPPED", trackingNumber, shippedAt: new Date() },
  });
  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${id}`);
  revalidatePath(`/order/${id}`);
}

// Selesai (SHIPPED -> DONE)
export async function completeOrder(id: string) {
  await prisma.order.update({ where: { id }, data: { status: "DONE" } });
  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${id}`);
}

// Batalkan + kembalikan stok
export async function cancelOrder(id: string) {
  const order = await prisma.order.findUnique({ where: { id }, include: { items: true } });
  if (!order || order.status === "CANCELLED" || order.status === "DONE") return;
  await applyOrderStatus(order.id, "CANCELLED");
  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${id}`);
}

// ---------- BULK PRODUK ----------
export async function bulkUpdateProducts(ids: string[], patch: { categoryId?: string; isActive?: boolean }) {
  if (!ids.length) return;
  const data: { categoryId?: string; isActive?: boolean } = {};
  if (patch.categoryId) data.categoryId = patch.categoryId;
  if (typeof patch.isActive === "boolean") data.isActive = patch.isActive;
  if (Object.keys(data).length === 0) return;
  await prisma.product.updateMany({ where: { id: { in: ids } }, data });
  revalidatePath("/admin/products");
  revalidatePath("/");
}

export async function bulkDeleteProducts(ids: string[]) {
  if (!ids.length) return;
  // produk yang sudah ada di order -> nonaktifkan; sisanya -> hapus
  const used = await prisma.orderItem.findMany({
    where: { productId: { in: ids } }, select: { productId: true }, distinct: ["productId"],
  });
  const usedIds = new Set(used.map((u) => u.productId));
  const deletable = ids.filter((id) => !usedIds.has(id));
  const deactivate = ids.filter((id) => usedIds.has(id));

  if (deactivate.length) await prisma.product.updateMany({ where: { id: { in: deactivate } }, data: { isActive: false } });
  if (deletable.length) {
    await prisma.productSize.deleteMany({ where: { productId: { in: deletable } } });
    await prisma.productImage.deleteMany({ where: { productId: { in: deletable } } });
    await prisma.product.deleteMany({ where: { id: { in: deletable } } });
  }
  revalidatePath("/admin/products");
  revalidatePath("/");
}

// ---------- APPEARANCE ----------
export async function setTheme(themeId: string) {
  await prisma.setting.upsert({
    where: { key: "theme" },
    update: { value: themeId },
    create: { key: "theme", value: themeId },
  });
  // re-render seluruh layout (warna/font berubah global)
  revalidatePath("/", "layout");
  redirect("/admin/appearance");
}
