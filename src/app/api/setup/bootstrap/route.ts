import { NextRequest, NextResponse } from "next/server";
import { ensureAdminAccount } from "@/lib/ensure-admin";

function isAuthorized(request: NextRequest) {
  const setupSecret = process.env.SETUP_SECRET?.trim();
  if (!setupSecret) return false;

  const authHeader = request.headers.get("authorization") || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7).trim() : "";
  return token.length > 0 && token === setupSecret;
}

export async function POST(request: NextRequest) {
  if (!process.env.SETUP_SECRET?.trim()) {
    return NextResponse.json(
      { error: "SETUP_SECRET is not configured on the server" },
      { status: 503 }
    );
  }

  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json().catch(() => ({}));
    const forceReset = body.forceReset === true || process.env.ADMIN_FORCE_RESET === "true";
    const result = await ensureAdminAccount(forceReset);

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
      message: "POST to this endpoint with Authorization: Bearer <SETUP_SECRET>",
      optionalBody: { forceReset: true },
    },
    { status: 405 }
  );
}
