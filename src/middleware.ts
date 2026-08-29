import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyAdminToken, COOKIE_NAME } from "@/lib/auth-edge";

function withNoStore(response: NextResponse) {
  response.headers.set(
    "Cache-Control",
    "private, no-store, no-cache, must-revalidate, max-age=0"
  );
  response.headers.set("Pragma", "no-cache");
  response.headers.set("Expires", "0");
  return response;
}

/**
 * Admin auth gate + no-store headers.
 * Uses Edge-safe JWT helpers only (never next/headers / Prisma).
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  try {
    const isStaticAsset =
      pathname.startsWith("/_next") ||
      pathname.startsWith("/uploads") ||
      pathname.startsWith("/brand") ||
      /\.(?:ico|png|jpg|jpeg|gif|webp|svg|css|js|map|woff2?)$/i.test(pathname);

    if (isStaticAsset) {
      return NextResponse.next();
    }

    // Login page must always render — never redirect-loop or crash here.
    if (pathname === "/admin/login" || pathname.startsWith("/admin/login/")) {
      try {
        const token = request.cookies.get(COOKIE_NAME)?.value;
        if (token) {
          const session = await verifyAdminToken(token);
          if (session) {
            return withNoStore(
              NextResponse.redirect(new URL("/admin", request.url))
            );
          }
        }
      } catch (error) {
        console.error("[middleware] login token check failed:", error);
      }
      return withNoStore(NextResponse.next());
    }

    if (pathname.startsWith("/admin")) {
      try {
        const token = request.cookies.get(COOKIE_NAME)?.value;
        if (!token) {
          return withNoStore(
            NextResponse.redirect(new URL("/admin/login", request.url))
          );
        }

        const session = await verifyAdminToken(token);
        if (!session) {
          const res = withNoStore(
            NextResponse.redirect(new URL("/admin/login", request.url))
          );
          res.cookies.delete(COOKIE_NAME);
          return res;
        }
      } catch (error) {
        console.error("[middleware] admin auth failed:", error);
        return withNoStore(
          NextResponse.redirect(new URL("/admin/login", request.url))
        );
      }

      return withNoStore(NextResponse.next());
    }

    return withNoStore(NextResponse.next());
  } catch (error) {
    console.error("[middleware] unexpected error:", error);
    // Never blank the login page — fall through to the route.
    if (pathname.startsWith("/admin/login")) {
      return NextResponse.next();
    }
    if (pathname.startsWith("/admin")) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
    return NextResponse.next();
  }
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
