import { NextRequest, NextResponse } from "next/server";
import {
  clearAdminCookie,
  createAdminToken,
  getAdminSession,
  setAdminCookie,
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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const email = String(body.email || "").trim().toLowerCase();
    const password = String(body.password || "").trim();

    if (!email || !password || !isValidLogin(email, password)) {
      return NextResponse.json({ error: "Identifiants invalides" }, { status: 401 });
    }

    const adminEmail = getAdminEmail();
    const token = await createAdminToken({
      adminId: adminEmail,
      email: adminEmail,
    });
    await setAdminCookie(token);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Admin login error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function DELETE() {
  await clearAdminCookie();
  return NextResponse.json({ success: true });
}

export async function GET() {
  const session = await getAdminSession();
  return NextResponse.json({ authenticated: !!session, email: session?.email });
}
