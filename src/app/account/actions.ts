"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { hashPassword, verifyPassword, createSession, destroySession, getCurrentUser } from "@/lib/auth-customer";

export async function registerUser(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");

  if (!name || !email || password.length < 6) {
    redirect("/account/register?error=" + encodeURIComponent("Lengkapi data, password minimal 6 karakter."));
  }

  const exists = await prisma.user.findUnique({ where: { email } });
  if (exists) {
    redirect("/account/register?error=" + encodeURIComponent("Email sudah terdaftar."));
  }

  const user = await prisma.user.create({
    data: { name, email, passwordHash: hashPassword(password) },
  });
  await createSession(user.id);
  redirect("/account");
}

export async function loginUser(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !verifyPassword(password, user.passwordHash)) {
    redirect("/account/login?error=" + encodeURIComponent("Email atau password salah."));
  }
  await createSession(user.id);
  redirect("/account");
}

export async function logoutUser() {
  await destroySession();
  redirect("/account/login");
}

// ---------- ALAMAT ----------
async function requireUser() {
  const user = await getCurrentUser();
  if (!user) redirect("/account/login");
  return user;
}

export async function addAddress(formData: FormData) {
  const user = await requireUser();
  const label = String(formData.get("label") ?? "Rumah").trim() || "Rumah";
  const recipient = String(formData.get("recipient") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const address = String(formData.get("address") ?? "").trim();
  const postalCode = String(formData.get("postalCode") ?? "").trim();
  const cityId = String(formData.get("cityId") ?? "").trim();
  const cityLabel = String(formData.get("cityLabel") ?? "").trim();
  if (!recipient || !phone || !address) {
    redirect("/account?error=" + encodeURIComponent("Lengkapi data alamat."));
  }

  const count = await prisma.address.count({ where: { userId: user.id } });
  const makeDefault = formData.get("isDefault") === "on" || count === 0;
  if (makeDefault) {
    await prisma.address.updateMany({ where: { userId: user.id }, data: { isDefault: false } });
  }
  await prisma.address.create({
    data: { userId: user.id, label, recipient, phone, address, postalCode, cityId, cityLabel, isDefault: makeDefault },
  });
  revalidatePath("/account");
  redirect("/account");
}

export async function updateAddress(id: string, formData: FormData) {
  const user = await requireUser();
  const owned = await prisma.address.findFirst({ where: { id, userId: user.id } });
  if (!owned) redirect("/account");

  const label = String(formData.get("label") ?? "Rumah").trim() || "Rumah";
  const recipient = String(formData.get("recipient") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const address = String(formData.get("address") ?? "").trim();
  const postalCode = String(formData.get("postalCode") ?? "").trim();
  const cityId = String(formData.get("cityId") ?? "").trim();
  const cityLabel = String(formData.get("cityLabel") ?? "").trim();
  const makeDefault = formData.get("isDefault") === "on";
  if (makeDefault) {
    await prisma.address.updateMany({ where: { userId: user.id }, data: { isDefault: false } });
  }
  await prisma.address.update({
    where: { id },
    data: { label, recipient, phone, address, postalCode, cityId, cityLabel, ...(makeDefault ? { isDefault: true } : {}) },
  });
  revalidatePath("/account");
  redirect("/account");
}

export async function deleteAddress(id: string) {
  const user = await requireUser();
  const owned = await prisma.address.findFirst({ where: { id, userId: user.id } });
  if (!owned) return;
  await prisma.address.delete({ where: { id } });
  // jika yang dihapus adalah default, jadikan salah satu sisanya default
  if (owned.isDefault) {
    const next = await prisma.address.findFirst({ where: { userId: user.id }, orderBy: { createdAt: "asc" } });
    if (next) await prisma.address.update({ where: { id: next.id }, data: { isDefault: true } });
  }
  revalidatePath("/account");
}

export async function setDefaultAddress(id: string) {
  const user = await requireUser();
  const owned = await prisma.address.findFirst({ where: { id, userId: user.id } });
  if (!owned) return;
  await prisma.address.updateMany({ where: { userId: user.id }, data: { isDefault: false } });
  await prisma.address.update({ where: { id }, data: { isDefault: true } });
  revalidatePath("/account");
}
