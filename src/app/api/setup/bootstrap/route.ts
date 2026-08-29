import { NextRequest, NextResponse } from "next/server";
import { bootstrapProductionDatabase } from "@/lib/bootstrap-db";
import { getSetupSecretConfigured, isSetupAuthorized } from "@/lib/setup-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    if (!getSetupSecretConfigured()) {
      return NextResponse.json(
        { error: "SETUP_SECRET is not configured on the server" },
        { status: 503 }
      );
    }

    if (!isSetupAuthorized(request)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const force = body.forceReset === true || body.force === true;
    const bootstrap = await bootstrapProductionDatabase({ forceAdmin: force });

    if (!bootstrap.ok || !bootstrap.admin) {
      return NextResponse.json(
        { error: bootstrap.error || "Bootstrap failed" },
        { status: 503 }
      );
    }

    return NextResponse.json({
      success: true,
      databaseUrl: bootstrap.databaseUrl,
      ...bootstrap.admin,
    });
  } catch (error) {
    console.error("Setup bootstrap error:", error);
    return NextResponse.json({ error: "Bootstrap failed" }, { status: 503 });
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
