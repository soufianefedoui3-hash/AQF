import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import { jsonError } from "@/lib/form-api";
import {
  deleteApplication,
  listApplications,
  updateApplicationStatus,
} from "@/lib/leads/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await getAdminSession();
    if (!session) return jsonError("Non autorisé", 401);
    return NextResponse.json(await listApplications());
  } catch (error) {
    console.error("[admin] applications GET failed:", error);
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
    const status = String(body?.status || "").trim();

    if (!id || !status) {
      return jsonError("id et status sont requis", 400);
    }

    const result = await updateApplicationStatus(id, status);
    if (!result.ok) return jsonError(result.error, 503);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[admin] applications PATCH failed:", error);
    return jsonError("Mise à jour temporairement indisponible", 503);
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getAdminSession();
    if (!session) return jsonError("Non autorisé", 401);

    const body = (await request.json().catch(() => null)) as Record<
      string,
      unknown
    > | null;
    const id = String(body?.id || "").trim();
    if (!id) return jsonError("ID requis", 400);

    const result = await deleteApplication(id);
    if (!result.ok) return jsonError(result.error, 503);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[admin] applications DELETE failed:", error);
    return jsonError("Suppression temporairement indisponible", 503);
  }
}
