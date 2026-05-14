import { NextResponse, type NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

const ADMIN_HOST = process.env.ADMIN_HOST ?? "baryresto-admin.qngine.com.ar";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const host = req.headers.get("host")?.split(":")[0] ?? "";
  const isAdminHost = host === ADMIN_HOST || host === "localhost";

  // Public host: only allow public routes (slug pages, API, static)
  if (!isAdminHost) {
    const isBlockedOnPublic =
      pathname.startsWith("/admin") ||
      pathname.startsWith("/platform") ||
      pathname.startsWith("/login");
    if (isBlockedOnPublic) {
      const url = req.nextUrl.clone();
      url.pathname = "/";
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  // Admin host: block slug routes, allow admin/platform/login
  const isPublicSlugRoute =
    !pathname.startsWith("/admin") &&
    !pathname.startsWith("/platform") &&
    !pathname.startsWith("/login") &&
    !pathname.startsWith("/login-redirect") &&
    !pathname.startsWith("/api") &&
    !pathname.startsWith("/_next") &&
    pathname !== "/favicon.ico";

  if (isPublicSlugRoute && pathname !== "/") {
    const url = req.nextUrl.clone();
    url.pathname = "/admin";
    return NextResponse.redirect(url);
  }

  // Redirect root to /admin on admin host
  if (pathname === "/") {
    const url = req.nextUrl.clone();
    url.pathname = "/admin";
    return NextResponse.redirect(url);
  }

  // Auth protection for /admin, /platform
  const isProtected =
    pathname.startsWith("/admin") ||
    pathname.startsWith("/platform");

  if (!isProtected) return NextResponse.next();

  const token = await getToken({
    req,
    secret: process.env.AUTH_SECRET,
    salt: "authjs.session-token",
  });

  if (!token) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(url);
  }

  if (pathname.startsWith("/platform") && !token.isPlatformAdmin) {
    const url = req.nextUrl.clone();
    url.pathname = "/admin";
    url.searchParams.set("error", "forbidden");
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
