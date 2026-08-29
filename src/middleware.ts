import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyAdminToken, COOKIE_NAME } from "@/lib/auth";

function withNoStore(response: NextResponse) {
  response.headers.set(
    "Cache-Control",
    "private, no-store, no-cache, must-revalidate, max-age=0"
  );
  response.headers.set("Pragma", "no-cache");
  response.headers.set("Expires", "0");
  return response;
}

export async function middleware(request: NextRequest) {
  try {
    const { pathname } = request.nextUrl;

    // Never cache HTML/CMS pages or APIs — admin edits must show immediately.
    const isStaticAsset =
      pathname.startsWith("/_next") ||
      pathname.startsWith("/uploads") ||
      pathname.startsWith("/brand") ||
      /\.(?:ico|png|jpg|jpeg|gif|webp|svg|css|js|map|woff2?)$/i.test(pathname);

    if (pathname === "/admin/login") {
      const token = request.cookies.get(COOKIE_NAME)?.value;
      if (token) {
        const session = await verifyAdminToken(token);
        if (session) {
          return withNoStore(
            NextResponse.redirect(new URL("/admin", request.url))
          );
        }
      }
      return withNoStore(NextResponse.next());
    }

    if (pathname.startsWith("/admin")) {
      const token = request.cookies.get(COOKIE_NAME)?.value;
      if (!token) {
        return withNoStore(
          NextResponse.redirect(new URL("/admin/login", request.url))
        );
      }

      const session = await verifyAdminToken(token);
      if (!session) {
        return withNoStore(
          NextResponse.redirect(new URL("/admin/login", request.url))
        );
      }

      return withNoStore(NextResponse.next());
    }

    if (!isStaticAsset) {
      return withNoStore(NextResponse.next());
    }

    return NextResponse.next();
  } catch (error) {
    console.error("Middleware error:", error);
    if (request.nextUrl.pathname.startsWith("/admin")) {
      return withNoStore(
        NextResponse.redirect(new URL("/admin/login", request.url))
      );
    }
    return withNoStore(NextResponse.next());
  }
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
