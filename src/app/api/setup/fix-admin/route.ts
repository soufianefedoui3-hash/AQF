import { NextRequest, NextResponse } from "next/server";
import { resolveProductionDatabaseUrl } from "@/lib/database-url";
import { fixAdminAccount, getAdminStatus } from "@/lib/ensure-admin";
import { getSetupSecretConfigured, isSetupAuthorized } from "@/lib/setup-auth";

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
  if (!getSetupSecretConfigured()) return secretNotConfigured();
  if (!isSetupAuthorized(request)) return unauthorized();

  try {
    resolveProductionDatabaseUrl();
    const status = await getAdminStatus();

    return NextResponse.json({
      success: true,
      ...status,
      canLogin: status.exists && status.passwordValid,
    });
  } catch (error) {
    console.error("Fix-admin status error:", error);
    return NextResponse.json({ error: "Unable to inspect admin account" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  if (!getSetupSecretConfigured()) return secretNotConfigured();
  if (!isSetupAuthorized(request)) return unauthorized();

  try {
    resolveProductionDatabaseUrl();
    const body = await request.json().catch(() => ({}));
    const force = body.force === true || body.forceReset === true;

    const result = await fixAdminAccount({ force });

    return NextResponse.json({
      success: true,
      ...result,
      loginEmail: result.email,
      hint: "Use ADMIN_EMAIL and ADMIN_PASSWORD from server environment variables.",
    });
  } catch (error) {
    console.error("Fix-admin error:", error);
    return NextResponse.json({ error: "Admin fix failed" }, { status: 500 });
  }
}
