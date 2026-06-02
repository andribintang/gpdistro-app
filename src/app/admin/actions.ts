"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { ADMIN_COOKIE, ADMIN_TOKEN, ADMIN_PASSWORD } from "@/lib/auth";

export type SizeInput = { label: string; stock: number };
export type ImageInput = { url: string; alt: string };
export type ProductInput = {
  name: string;
  slug: string;
  categoryId: string;
  basePrice: number;
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
      basePrice: data.basePrice, oldPrice: data.oldPrice,
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
      basePrice: data.basePrice, oldPrice: data.oldPrice,
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
