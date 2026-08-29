import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import { jsonError } from "@/lib/form-api";
import { listLeads, updateLeadStatus } from "@/lib/leads/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const session = await getAdminSession();
    if (!session) return jsonError("Non autorisé", 401);

    const type = request.nextUrl.searchParams.get("type") || "all";
    return NextResponse.json(await listLeads(type));
  } catch (error) {
    console.error("[admin] leads GET failed:", error);
    return NextResponse.json([]);
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await getAdminSession();
    if (!session) return jsonError("Non autorisé", 401);

    const body = (await request.json().catch(() => null)) as Record<
      string,
      unknown
    > | null;
    const id = String(body?.id || "").trim();
    const type = String(body?.type || "").trim();
    const status = String(body?.status || "").trim();

    if (!id || !type || !status) {
      return jsonError("id, type et status sont requis", 400);
    }

    const result = await updateLeadStatus(type, id, status);
    if (!result.ok) {
      const statusCode = result.error === "Type invalide" ? 400 : 503;
      return jsonError(result.error, statusCode);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[admin] leads PATCH failed:", error);
    return jsonError("Mise à jour temporairement indisponible", 503);
  }
}
