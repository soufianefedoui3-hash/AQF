import { NextResponse } from "next/server";
import { getFormationTypes } from "@/lib/formations";

export async function GET() {
  try {
    const formations = await getFormationTypes();
    return NextResponse.json(formations);
  } catch {
    return NextResponse.json([]);
  }
}
