import { cookies } from "next/headers";

export const ADMIN_COOKIE = "gp_admin";
export const ADMIN_TOKEN = process.env.ADMIN_TOKEN || "gp-admin-secret-session";
export const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admin123";

// Dipakai di server component sebagai lapisan kedua (utama: middleware).
export function isAuthed() {
  return cookies().get(ADMIN_COOKIE)?.value === ADMIN_TOKEN;
}
