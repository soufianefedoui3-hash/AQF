import { NextRequest, NextResponse } from "next/server";
import { bootstrapProductionDatabase } from "@/lib/bootstrap-db";
import { getAdminStatus } from "@/lib/ensure-admin";
import { getSetupSecretConfigured, isSetupAuthorized } from "@/lib/setup-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function unauthorized() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

function secretNotConfigured() {
  return NextResponse.json(
    {
      error: "SETUP_SECRET or FIX_ADMIN_SECRET is not configured on the server",
    },
    { status: 503 }
  );
}

export async function GET(request: NextRequest) {
  try {
    if (!getSetupSecretConfigured()) return secretNotConfigured();
    if (!isSetupAuthorized(request)) return unauthorized();

    const status = await getAdminStatus();
    return NextResponse.json({
      success: true,
      ...status,
      canLogin: status.exists && status.passwordValid,
    });
  } catch (error) {
    console.error("Fix-admin status error:", error);
    return NextResponse.json(
      { error: "Unable to inspect admin account" },
      { status: 503 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    if (!getSetupSecretConfigured()) return secretNotConfigured();
    if (!isSetupAuthorized(request)) return unauthorized();

    const body = await request.json().catch(() => ({}));
    const force = body.force === true || body.forceReset === true;
    const bootstrap = await bootstrapProductionDatabase({ forceAdmin: force });

    if (!bootstrap.ok || !bootstrap.admin) {
      return NextResponse.json(
        { error: bootstrap.error || "Bootstrap failed" },
        { status: 503 }
      );
    }

    return NextResponse.json({
      success: true,
      ...bootstrap.admin,
      databaseUrl: bootstrap.databaseUrl,
      loginEmail: bootstrap.admin.email,
      hint: "Use ADMIN_EMAIL and ADMIN_PASSWORD from server environment variables.",
    });
  } catch (error) {
    console.error("Fix-admin error:", error);
    return NextResponse.json({ error: "Admin fix failed" }, { status: 503 });
  }
}
