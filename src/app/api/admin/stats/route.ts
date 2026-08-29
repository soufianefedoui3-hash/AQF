import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import { jsonError } from "@/lib/form-api";
import { getLeadStats } from "@/lib/leads/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await getAdminSession();
    if (!session) return jsonError("Non autorisé", 401);
    return NextResponse.json(await getLeadStats());
  } catch (error) {
    console.error("[admin] stats GET failed:", error);
    return NextResponse.json({
      stats: {
        totalLeads: 0,
        consultations: 0,
        accompagnements: 0,
        formations: 0,
        audits: 0,
        webServices: 0,
        applications: 0,
      },
      recent: [],
    });
  }
}
