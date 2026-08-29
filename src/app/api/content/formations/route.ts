import { NextResponse } from "next/server";
import { FORMATION_TYPES } from "@/lib/constants";
import { getFormationTypes } from "@/lib/formations";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const formations = await getFormationTypes();
    // Honor empty active list from DB; fallback only on failure.
    return NextResponse.json(Array.isArray(formations) ? formations : [...FORMATION_TYPES]);
  } catch {
    return NextResponse.json([...FORMATION_TYPES]);
  }
}
