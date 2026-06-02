import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const ADMIN_COOKIE = "gp_admin";
const ADMIN_TOKEN = process.env.ADMIN_TOKEN || "gp-admin-secret-session";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // halaman login bebas diakses
  if (pathname === "/admin/login") return NextResponse.next();

  if (pathname.startsWith("/admin")) {
    const token = req.cookies.get(ADMIN_COOKIE)?.value;
    if (token !== ADMIN_TOKEN) {
      const url = req.nextUrl.clone();
      url.pathname = "/admin/login";
      return NextResponse.redirect(url);
    }
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
