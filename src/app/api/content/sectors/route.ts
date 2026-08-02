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

    if (options.length === 0) {
      return NextResponse.json(
        FALLBACK_SECTORS.map((sector) => ({
          slug: sector.slug,
          name: sector.name,
        }))
      );
    }

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
