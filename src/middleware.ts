import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyAdminToken, COOKIE_NAME } from "@/lib/auth";

export async function middleware(request: NextRequest) {
  try {
    const { pathname } = request.nextUrl;

    if (pathname === "/admin/login") {
      const token = request.cookies.get(COOKIE_NAME)?.value;
      if (token) {
        const session = await verifyAdminToken(token);
        if (session) {
          return NextResponse.redirect(new URL("/admin", request.url));
        }
      }
      return NextResponse.next();
    }

    if (pathname.startsWith("/admin")) {
      const token = request.cookies.get(COOKIE_NAME)?.value;
      if (!token) {
        return NextResponse.redirect(new URL("/admin/login", request.url));
      }

      const session = await verifyAdminToken(token);
      if (!session) {
        return NextResponse.redirect(new URL("/admin/login", request.url));
      }
    }

    return NextResponse.next();
  } catch (error) {
    console.error("Middleware error:", error);
    if (request.nextUrl.pathname.startsWith("/admin")) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
    return NextResponse.next();
  }
}

export const config = {
  matcher: ["/admin/:path*"],
};
