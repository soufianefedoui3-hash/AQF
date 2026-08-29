import { NextResponse } from "next/server";
import { FALLBACK_SECTORS, getSectors } from "@/lib/content";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const sectors = await getSectors();
    const options = sectors
      .filter((sector) => sector.slug?.trim() && sector.name?.trim())
      .map((sector) => ({
        slug: sector.slug.trim(),
        name: sector.name.trim(),
      }));

    // Honor empty DB list; fallback only when the query path failed (getSectors catch).
    return NextResponse.json(options);
  } catch {
    return NextResponse.json(
      FALLBACK_SECTORS.map((sector) => ({
        slug: sector.slug,
        name: sector.name,
      }))
    );
  }
}
