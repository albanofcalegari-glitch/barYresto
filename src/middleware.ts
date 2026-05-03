import { NextResponse, type NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

/**
 * Gate mínimo: protege /admin, /app y /platform.
 * - Sin sesión → /login
 * - /platform sólo si isPlatformAdmin
 *
 * La resolución de tenant por slug ocurre en el segmento público `[slug]`,
 * no acá (para mantener el middleware liviano y edge-friendly).
 */
export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const isProtected =
    pathname.startsWith("/admin") ||
    pathname.startsWith("/app") ||
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
  matcher: ["/admin/:path*", "/app/:path*", "/platform/:path*"],
};
