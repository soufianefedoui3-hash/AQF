import { NextRequest, NextResponse } from "next/server";
import { ADMIN_COOKIE_NAME } from "@/lib/auth-constants";
import { createAdminToken } from "@/lib/auth-edge";
import { authenticateAdmin } from "@/lib/admin-authenticate";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Behind Hostinger / reverse proxies, Secure cookies are dropped on plain HTTP.
 */
function shouldUseSecureCookie(request: NextRequest): boolean {
  try {
    if (process.env.COOKIE_SECURE === "true") return true;
    if (process.env.COOKIE_SECURE === "false") return false;

    const forwarded = request.headers.get("x-forwarded-proto");
    if (forwarded) {
      return forwarded.split(",")[0]?.trim().toLowerCase() === "https";
    }

    return request.nextUrl.protocol === "https:";
  } catch {
    return false;
  }
}

function applyAdminCookie(
  response: NextResponse,
  token: string,
  request: NextRequest
) {
  try {
    response.cookies.set(ADMIN_COOKIE_NAME, token, {
      httpOnly: true,
      secure: shouldUseSecureCookie(request),
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });
  } catch (error) {
    console.error("[auth] cookie set failed:", error);
  }
}

function clearCookieOnResponse(response: NextResponse, request: NextRequest) {
  try {
    response.cookies.set(ADMIN_COOKIE_NAME, "", {
      httpOnly: true,
      secure: shouldUseSecureCookie(request),
      sameSite: "lax",
      path: "/",
      maxAge: 0,
    });
  } catch {
    /* ignore */
  }
}

/**
 * Admin login — NEVER returns HTTP 500.
 * Failures are always structured JSON for the login form.
 */
export async function POST(request: NextRequest) {
  try {
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "JSON invalide" }, { status: 400 });
    }

    const record =
      body && typeof body === "object" ? (body as Record<string, unknown>) : {};
    const email = String(record.email || "");
    const password = String(record.password || "");

    let result;
    try {
      result = await authenticateAdmin(email, password);
    } catch (authError) {
      console.error("[auth] authenticateAdmin threw:", authError);
      return NextResponse.json(
        { error: "Configuration error — authentification indisponible" },
        { status: 503 }
      );
    }

    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: 401 });
    }

    let token: string;
    try {
      token = await createAdminToken({
        adminId: result.adminId,
        email: result.email,
      });
    } catch (tokenError) {
      console.error("[auth] JWT create failed:", tokenError);
      return NextResponse.json(
        {
          error:
            "Configuration error — vérifiez JWT_SECRET sur le serveur (Hostinger).",
        },
        { status: 503 }
      );
    }

    const response = NextResponse.json({
      success: true,
      email: result.email,
    });
    applyAdminCookie(response, token, request);
    return response;
  } catch (error) {
    console.error("[auth] unexpected login error:", error);
    return NextResponse.json(
      { error: "Configuration error — réessayez dans un instant" },
      { status: 503 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  const response = NextResponse.json({ success: true });
  clearCookieOnResponse(response, request);
  return response;
}

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get(ADMIN_COOKIE_NAME)?.value;
    if (!token) {
      return NextResponse.json({ authenticated: false, email: null });
    }

    const { verifyAdminToken } = await import("@/lib/auth-edge");
    const session = await verifyAdminToken(token);
    return NextResponse.json({
      authenticated: !!session,
      email: session?.email ?? null,
    });
  } catch (error) {
    console.error("[auth] session check failed:", error);
    return NextResponse.json({ authenticated: false, email: null });
  }
}
