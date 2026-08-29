import { prisma } from "@/lib/prisma";
import { FORMATION_TYPES as FALLBACK_FORMATIONS } from "@/lib/constants";
import { safeCmsQuery } from "@/lib/cms-live";
import { SECTOR_PLACEHOLDER_IMAGES } from "@/lib/placeholder-images";

/** Local sector placeholders (no external CDN). */
export const SECTOR_DEFAULT_IMAGES: Record<string, string> = {
  ...SECTOR_PLACEHOLDER_IMAGES,
};

export async function getFormationTypes() {
  const types = await safeCmsQuery(
    () =>
      prisma.formationType.findMany({
        where: { active: true },
        orderBy: { order: "asc" },
      }),
    null
  );

  if (!types) return [...FALLBACK_FORMATIONS];
  return types.map((t) => t.name);
}

export async function getFormationTypesFull() {
  return safeCmsQuery(
    () => prisma.formationType.findMany({ orderBy: { order: "asc" } }),
    []
  );
}
