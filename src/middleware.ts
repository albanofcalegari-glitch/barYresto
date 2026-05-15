import { NextResponse, type NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

const ADMIN_HOST = process.env.ADMIN_HOST ?? "baryresto-admin.qngine.com.ar";
const PLATFORM_HOST = process.env.PLATFORM_HOST ?? "platform-baryresto.qngine.com.ar";
const IS_PROD = process.env.AUTH_URL?.startsWith("https://") ?? false;

function getSessionToken(req: NextRequest) {
  return getToken({
    req,
    secret: process.env.AUTH_SECRET,
    secureCookie: IS_PROD,
  });
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const host = req.headers.get("host")?.split(":")[0] ?? "";

  const isPlatformHost = host === PLATFORM_HOST;
  const isAdminHost = host === ADMIN_HOST;
  const isDevHost = host === "localhost";
  const isPublicHost = !isPlatformHost && !isAdminHost && !isDevHost;

  // ── Public host: only public routes ──
  if (isPublicHost) {
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

  if (pathname.startsWith("/registro")) return NextResponse.next();

  // ── Platform host: only /platform + /login ──
  if (isPlatformHost) {
    const isAllowed =
      pathname.startsWith("/platform") ||
      pathname.startsWith("/login") ||
      pathname.startsWith("/login-redirect") ||
      pathname.startsWith("/api") ||
      pathname.startsWith("/_next") ||
      pathname === "/favicon.ico";

    if (!isAllowed || pathname === "/") {
      const url = req.nextUrl.clone();
      url.pathname = "/platform";
      return NextResponse.redirect(url);
    }

    if (pathname.startsWith("/platform")) {
      const token = await getSessionToken(req);
      if (!token) {
        const url = req.nextUrl.clone();
        url.pathname = "/login";
        url.searchParams.set("callbackUrl", pathname);
        return NextResponse.redirect(url);
      }
      if (!token.isPlatformAdmin) {
        const url = req.nextUrl.clone();
        url.pathname = "/login";
        url.searchParams.set("error", "forbidden");
        return NextResponse.redirect(url);
      }
    }

    return NextResponse.next();
  }

  // ── Admin host (+ localhost dev): /admin + /login, block /platform ──
  const isAllowed =
    pathname.startsWith("/admin") ||
    pathname.startsWith("/login") ||
    pathname.startsWith("/login-redirect") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/_next") ||
    pathname === "/favicon.ico";

  // Dev host: also allow /platform for convenience
  if (isDevHost) {
    const isDevAllowed = isAllowed || pathname.startsWith("/platform");
    if (!isDevAllowed && pathname !== "/") {
      const url = req.nextUrl.clone();
      url.pathname = "/admin";
      return NextResponse.redirect(url);
    }
  } else if (!isAllowed && pathname !== "/") {
    const url = req.nextUrl.clone();
    url.pathname = "/admin";
    return NextResponse.redirect(url);
  }

  if (pathname === "/") {
    const url = req.nextUrl.clone();
    url.pathname = "/admin";
    return NextResponse.redirect(url);
  }

  // Block /platform on admin host (not dev)
  if (!isDevHost && pathname.startsWith("/platform")) {
    const url = req.nextUrl.clone();
    url.pathname = "/admin";
    return NextResponse.redirect(url);
  }

  // Auth protection
  const isProtected =
    pathname.startsWith("/admin") ||
    pathname.startsWith("/platform");

  if (!isProtected) return NextResponse.next();

  const token = await getSessionToken(req);

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
