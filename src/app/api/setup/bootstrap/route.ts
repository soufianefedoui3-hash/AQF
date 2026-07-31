import { NextRequest, NextResponse } from "next/server";
import { resolveProductionDatabaseUrl } from "@/lib/database-url";
import { fixAdminAccount } from "@/lib/ensure-admin";
import { getSetupSecretConfigured, isSetupAuthorized } from "@/lib/setup-auth";

export async function POST(request: NextRequest) {
  if (!getSetupSecretConfigured()) {
    return NextResponse.json(
      { error: "SETUP_SECRET is not configured on the server" },
      { status: 503 }
    );
  }

  if (!isSetupAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    resolveProductionDatabaseUrl();
    const body = await request.json().catch(() => ({}));
    const force = body.forceReset === true || body.force === true;
    const result = await fixAdminAccount({ force });

    return NextResponse.json({
      success: true,
      ...result,
    });
  } catch (error) {
    console.error("Setup bootstrap error:", error);
    return NextResponse.json({ error: "Bootstrap failed" }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json(
    {
      message: "POST with Authorization: Bearer <SETUP_SECRET>",
      alternative: "POST /api/setup/fix-admin for admin repair/status",
      optionalBody: { forceReset: true },
    },
    { status: 405 }
  );
}
