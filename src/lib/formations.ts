import { FORMATION_TYPES as FALLBACK_FORMATIONS } from "@/lib/constants";
import { SECTOR_PLACEHOLDER_IMAGES } from "@/lib/placeholder-images";
import { listFormations } from "@/lib/cms/store";

/** Local sector placeholders (no external CDN). */
export const SECTOR_DEFAULT_IMAGES: Record<string, string> = {
  ...SECTOR_PLACEHOLDER_IMAGES,
};

export async function getFormationTypes() {
  try {
    const types = await listFormations(true);
    if (types.length === 0) return [...FALLBACK_FORMATIONS];
    return types.map((t) => t.name);
  } catch {
    return [...FALLBACK_FORMATIONS];
  }
}

export async function getFormationTypesFull() {
  try {
    return await listFormations(false);
  } catch {
    return [];
  }
}
