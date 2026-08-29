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

function isLoginPath(pathname: string): boolean {
  return pathname === "/admin/login" || pathname.startsWith("/admin/login/");
}

/**
 * Admin auth gate + no-store headers.
 * Uses Edge-safe JWT helpers only (never next/headers / Prisma).
 *
 * Login must NEVER depend on token verification — jose/cookie quirks on
 * Hostinger must not turn /admin/login into a 500.
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  try {
    const isStaticAsset =
      pathname.startsWith("/_next") ||
      pathname.startsWith("/uploads") ||
      pathname.startsWith("/brand") ||
      pathname.startsWith("/placeholders") ||
      /\.(?:ico|png|jpg|jpeg|gif|webp|svg|css|js|map|woff2?)$/i.test(pathname);

    if (isStaticAsset) {
      return NextResponse.next();
    }

    // Always let the login page render — no JWT / redirect logic here.
    if (isLoginPath(pathname)) {
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

        let session = null;
        try {
          session = await verifyAdminToken(token);
        } catch (verifyError) {
          console.error("[middleware] verifyAdminToken failed:", verifyError);
          session = null;
        }

        if (!session) {
          const res = withNoStore(
            NextResponse.redirect(new URL("/admin/login", request.url))
          );
          try {
            res.cookies.delete(COOKIE_NAME);
          } catch {
            /* ignore cookie delete failures */
          }
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
    if (isLoginPath(pathname)) {
      return NextResponse.next();
    }
    if (pathname.startsWith("/admin")) {
      try {
        return NextResponse.redirect(new URL("/admin/login", request.url));
      } catch {
        return NextResponse.next();
      }
    }
    return NextResponse.next();
  }
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
