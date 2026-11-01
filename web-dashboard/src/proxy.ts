import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { SESSION_COOKIE } from "@/lib/server/session";

// Daftar prefix rute publik yang dapat diakses tanpa autentikasi admin
const PUBLIC_PATH_PREFIXES = ["/login", "/trace"];

function isPublicPath(pathname: string): boolean {
  return PUBLIC_PATH_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

function sanitizeReturnUrl(returnUrl: string | null): string | null {
  if (!returnUrl) return null;
  // Mencegah open-redirect vulnerability: hanya izinkan path internal relatif
  if (returnUrl.startsWith("/") && !returnUrl.startsWith("//") && !returnUrl.includes("://")) {
    return returnUrl;
  }
  return null;
}

export function proxy(request: NextRequest) {
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  const { pathname, search } = request.nextUrl;
  const isLoginPage = pathname === "/login";

  // Jika sudah terautentikasi dan membuka halaman login, arahkan ke returnUrl atau /dashboard
  if (isLoginPage && token) {
    const rawReturnUrl = request.nextUrl.searchParams.get("returnUrl");
    const safeUrl = sanitizeReturnUrl(rawReturnUrl) ?? "/dashboard";
    return NextResponse.redirect(new URL(safeUrl, request.url));
  }

  // Jika belum login dan rute bukan rute publik, redirect ke /login dengan parameter returnUrl
  if (!isPublicPath(pathname) && !token) {
    const loginUrl = new URL("/login", request.url);
    const fullTarget = pathname + search;
    if (fullTarget && fullTarget !== "/") {
      loginUrl.searchParams.set("returnUrl", fullTarget);
    }
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};

