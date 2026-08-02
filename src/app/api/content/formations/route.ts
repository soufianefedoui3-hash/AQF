import { NextResponse } from "next/server";
import { FORMATION_TYPES } from "@/lib/constants";
import { getFormationTypes } from "@/lib/formations";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const formations = await getFormationTypes();
    if (Array.isArray(formations) && formations.length > 0) {
      return NextResponse.json(formations);
    }
    return NextResponse.json([...FORMATION_TYPES]);
  } catch {
    return NextResponse.json([...FORMATION_TYPES]);
  }
}
