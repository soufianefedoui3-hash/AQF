import { prisma } from "@/lib/prisma";
import { FORMATION_TYPES as FALLBACK_FORMATIONS } from "@/lib/constants";
import { liveCmsQuery } from "@/lib/cms-live";
import { SECTOR_PLACEHOLDER_IMAGES } from "@/lib/placeholder-images";

/** Local sector placeholders (no external CDN). */
export const SECTOR_DEFAULT_IMAGES: Record<string, string> = {
  ...SECTOR_PLACEHOLDER_IMAGES,
};

export async function getFormationTypes() {
  try {
    const types = await liveCmsQuery(() =>
      prisma.formationType.findMany({
        where: { active: true },
        orderBy: { order: "asc" },
      })
    );
    return types.map((t) => t.name);
  } catch {
    return [...FALLBACK_FORMATIONS];
  }
}

export async function getFormationTypesFull() {
  try {
    return await liveCmsQuery(() =>
      prisma.formationType.findMany({ orderBy: { order: "asc" } })
    );
  } catch {
    return [];
  }
}
