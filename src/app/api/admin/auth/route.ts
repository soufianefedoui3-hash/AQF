import { timingSafeEqual } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import {
  COOKIE_NAME,
  clearAdminCookie,
  createAdminToken,
  getAdminSession,
} from "@/lib/auth";
import {
  getAdminCredentials,
  getAuthConfigStatus,
} from "@/lib/env-credentials";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function safeEqual(a: string, b: string): boolean {
  try {
    const left = Buffer.from(String(a ?? ""), "utf8");
    const right = Buffer.from(String(b ?? ""), "utf8");
    if (left.length !== right.length) return false;
    if (left.length === 0) return true;
    return timingSafeEqual(left, right);
  } catch {
    return false;
  }
}

function isValidLogin(email: string, password: string): boolean {
  try {
    const { email: expectedEmail, password: expectedPassword } =
      getAdminCredentials();
    return (
      safeEqual(email, expectedEmail) && safeEqual(password, expectedPassword)
    );
  } catch (error) {
    console.error("[auth] isValidLogin failed:", error);
    return false;
  }
}

/**
 * Behind Hostinger / reverse proxies, NODE_ENV=production alone is not enough:
 * Secure cookies are dropped on plain HTTP and login appears to "fail".
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
    response.cookies.set(COOKIE_NAME, token, {
      httpOnly: true,
      secure: shouldUseSecureCookie(request),
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });
  } catch (error) {
    console.error("[auth] applyAdminCookie failed:", error);
  }
}

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
    const email = String(record.email || "")
      .trim()
      .toLowerCase();
    const password = String(record.password || "").trim();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email et mot de passe requis" },
        { status: 400 }
      );
    }

    if (!isValidLogin(email, password)) {
      return NextResponse.json(
        { error: "Identifiants invalides" },
        { status: 401 }
      );
    }

    const { email: adminEmail } = getAdminCredentials();

    let token: string;
    try {
      token = await createAdminToken({
        adminId: adminEmail,
        email: adminEmail,
      });
    } catch (tokenError) {
      console.error("Admin JWT creation failed:", tokenError);
      // Do not crash the login UX with a bare 500 — surface a form message.
      return NextResponse.json(
        {
          error:
            "Impossible de créer la session. Vérifiez JWT_SECRET sur le serveur.",
        },
        { status: 503 }
      );
    }

    const response = NextResponse.json({ success: true, email: adminEmail });
    applyAdminCookie(response, token, request);
    return response;
  } catch (error) {
    console.error("Admin login error:", error);
    // Prefer a client-friendly auth message over a fatal "Erreur serveur".
    return NextResponse.json(
      { error: "Identifiants invalides ou service temporairement indisponible" },
      { status: 401 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    await clearAdminCookie();
  } catch (error) {
    console.error("Admin logout error:", error);
  }

  const response = NextResponse.json({ success: true });
  try {
    response.cookies.set(COOKIE_NAME, "", {
      httpOnly: true,
      secure: shouldUseSecureCookie(request),
      sameSite: "lax",
      path: "/",
      maxAge: 0,
    });
  } catch (error) {
    console.error("Admin logout cookie clear failed:", error);
  }
  return response;
}

export async function GET() {
  try {
    const session = await getAdminSession();
    const config = getAuthConfigStatus();
    return NextResponse.json({
      authenticated: !!session,
      email: session?.email ?? null,
      warning: config.warning,
    });
  } catch (error) {
    console.error("Admin session check error:", error);
    return NextResponse.json({
      authenticated: false,
      email: null,
      warning: null,
    });
  }
}
