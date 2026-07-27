import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  createAdminToken,
  getAdminSession,
  setAdminCookie,
} from "@/lib/auth";
import { verifyPassword } from "@/lib/password";

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    const admin = await prisma.admin.findUnique({ where: { email } });
    if (!admin) {
      return NextResponse.json({ error: "Identifiants invalides" }, { status: 401 });
    }

    const valid = await verifyPassword(password, admin.passwordHash);
    if (!valid) {
      return NextResponse.json({ error: "Identifiants invalides" }, { status: 401 });
    }

    const token = await createAdminToken({ adminId: admin.id, email: admin.email });
    await setAdminCookie(token);

    return NextResponse.json({ success: true });
  } catch {
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
