import { NextRequest, NextResponse } from "next/server";
import {
  createAdminToken,
  getAdminSession,
  setAdminCookie,
} from "@/lib/auth";
import { credentialsMatchEnv, getAdminCredentials } from "@/lib/env-credentials";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const email = String(body.email || "").trim().toLowerCase();
    const password = String(body.password || "").trim();

    if (!email || !password) {
      return NextResponse.json({ error: "Identifiants invalides" }, { status: 401 });
    }

    if (!credentialsMatchEnv(email, password)) {
      return NextResponse.json({ error: "Identifiants invalides" }, { status: 401 });
    }

    const { email: adminEmail } = getAdminCredentials();
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
  const { clearAdminCookie } = await import("@/lib/auth");
  await clearAdminCookie();
  return NextResponse.json({ success: true });
}

export async function GET() {
  const session = await getAdminSession();
  return NextResponse.json({ authenticated: !!session, email: session?.email });
}
