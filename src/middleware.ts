import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { ADMIN_COOKIE_NAME } from "@/lib/auth-constants";

function withNoStore(response: NextResponse) {
  response.headers.set(
    "Cache-Control",
    "private, no-store, no-cache, must-revalidate, max-age=0"
  );
  response.headers.set("Pragma", "no-cache");
  response.headers.set("Expires", "0");
  return response;
}

function redirectToLogin(request: NextRequest) {
  const res = withNoStore(
    NextResponse.redirect(new URL("/admin/login", request.url))
  );
  try {
    res.cookies.delete(ADMIN_COOKIE_NAME);
  } catch {
    /* ignore */
  }
  return res;
}

/**
 * SMOKING GUN FIX:
 * Previous middleware imported `@/lib/auth-edge` → `jose` at module top-level.
 * On Hostinger Edge, that module evaluation can 500 *before* any try/catch,
 * including for GET /admin/login.
 *
 * This middleware:
 * - Does NOT match /admin/login at all (see matcher)
 * - Does NOT statically import jose
 * - Dynamically imports JWT verify only for protected /admin/* routes
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Belt-and-suspenders if matcher ever changes.
  if (
    pathname === "/admin/login" ||
    pathname.startsWith("/admin/login/")
  ) {
    return withNoStore(NextResponse.next());
  }

  if (!pathname.startsWith("/admin")) {
    return withNoStore(NextResponse.next());
  }

  try {
    const token = request.cookies.get(ADMIN_COOKIE_NAME)?.value;
    if (!token) {
      return redirectToLogin(request);
    }

    let session = null;
    try {
      const { verifyAdminToken } = await import("@/lib/auth-edge");
      session = await verifyAdminToken(token);
    } catch (error) {
      console.error("[middleware] JWT verify failed:", error);
      session = null;
    }

    if (!session) {
      return redirectToLogin(request);
    }

    return withNoStore(NextResponse.next());
  } catch (error) {
    console.error("[middleware] unexpected:", error);
    try {
      return redirectToLogin(request);
    } catch {
      return NextResponse.next();
    }
  }
}

export const config = {
  matcher: [
    /*
     * Gate only protected admin routes.
     * /admin/login is intentionally EXCLUDED so Edge never runs
     * (and never loads jose) for the login page.
     */
    "/admin",
    "/admin/((?!login(?:/|$)).*)",
  ],
};
