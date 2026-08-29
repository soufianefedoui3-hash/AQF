import { NextRequest, NextResponse } from "next/server";
import {
  COOKIE_NAME,
  clearAdminCookie,
  createAdminToken,
  getAdminSession,
} from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const DEFAULT_EMAIL = "admin@aqf.ma";
const DEFAULT_PASSWORD = "Admin@AQF2026";

function stripQuotes(value: string): string {
  const trimmed = value.trim();
  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return trimmed.slice(1, -1).trim();
  }
  return trimmed;
}

function getAdminEmail(): string {
  return stripQuotes(process.env.ADMIN_EMAIL || DEFAULT_EMAIL).toLowerCase();
}

function getAdminPassword(): string {
  return stripQuotes(process.env.ADMIN_PASSWORD || DEFAULT_PASSWORD);
}

function isValidLogin(email: string, password: string): boolean {
  return email === getAdminEmail() && password === getAdminPassword();
}

function applyAdminCookie(response: NextResponse, token: string) {
  response.cookies.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
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
    const email = String(record.email || "").trim().toLowerCase();
    const password = String(record.password || "").trim();

    if (!email || !password || !isValidLogin(email, password)) {
      return NextResponse.json({ error: "Identifiants invalides" }, { status: 401 });
    }

    const adminEmail = getAdminEmail();
    const token = await createAdminToken({
      adminId: adminEmail,
      email: adminEmail,
    });

    const response = NextResponse.json({ success: true });
    applyAdminCookie(response, token);
    return response;
  } catch (error) {
    console.error("Admin login error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    await clearAdminCookie();
  } catch (error) {
    console.error("Admin logout error:", error);
  }

  const response = NextResponse.json({ success: true });
  response.cookies.delete(COOKIE_NAME);
  return response;
}

export async function GET() {
  try {
    const session = await getAdminSession();
    return NextResponse.json({
      authenticated: !!session,
      email: session?.email ?? null,
    });
  } catch (error) {
    console.error("Admin session check error:", error);
    return NextResponse.json({ authenticated: false, email: null });
  }
}
