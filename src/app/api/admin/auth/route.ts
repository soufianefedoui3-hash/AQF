import { NextRequest, NextResponse } from "next/server";
import {
  createAdminToken,
  getAdminSession,
  setAdminCookie,
} from "@/lib/auth";
import { authenticateAdmin } from "@/lib/admin-login";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const email = String(body.email || "");
    const password = String(body.password || "");

    const auth = await authenticateAdmin(email, password);

    if (!auth.success) {
      return NextResponse.json({ error: "Identifiants invalides" }, { status: 401 });
    }

    const token = await createAdminToken({
      adminId: auth.adminId,
      email: auth.email,
    });
    await setAdminCookie(token);

    return NextResponse.json({
      success: true,
      source: auth.source,
    });
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
