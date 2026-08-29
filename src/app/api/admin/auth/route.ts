import { NextRequest, NextResponse } from "next/server";
import { authenticateAdmin } from "@/lib/auth/authenticate";
import {
  applyAdminCookie,
  clearAdminCookieOnResponse,
  createAdminToken,
  verifyAdminToken,
  COOKIE_NAME,
} from "@/lib/auth/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function jsonError(error: string, status: number) {
  return NextResponse.json({ error }, { status });
}

/**
 * Admin login — Node HMAC cookie, never HTTP 500.
 */
export async function POST(request: NextRequest) {
  try {
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return jsonError("JSON invalide", 400);
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
      return jsonError("Authentification temporairement indisponible", 503);
    }

    if (!result.ok) {
      return jsonError(result.error, 401);
    }

    let token: string;
    try {
      token = createAdminToken({
        adminId: result.adminId,
        email: result.email,
      });
    } catch (tokenError) {
      console.error("[auth] token create failed:", tokenError);
      return jsonError("Impossible de créer la session. Vérifiez JWT_SECRET.", 503);
    }

    const response = NextResponse.json({
      success: true,
      email: result.email,
    });
    applyAdminCookie(response, token, request);
    return response;
  } catch (error) {
    console.error("[auth] unexpected login error:", error);
    return jsonError("Service temporairement indisponible", 503);
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const response = NextResponse.json({ success: true });
    clearAdminCookieOnResponse(response, request);
    return response;
  } catch {
    return NextResponse.json({ success: true });
  }
}

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get(COOKIE_NAME)?.value;
    if (!token) {
      return NextResponse.json({ authenticated: false, email: null });
    }
    const session = verifyAdminToken(token);
    return NextResponse.json({
      authenticated: !!session,
      email: session?.email ?? null,
    });
  } catch (error) {
    console.error("[auth] session check failed:", error);
    return NextResponse.json({ authenticated: false, email: null });
  }
}
