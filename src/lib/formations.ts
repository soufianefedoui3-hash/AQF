import { prisma } from "@/lib/prisma";
import { FORMATION_TYPES as FALLBACK_FORMATIONS } from "@/lib/constants";

export const SECTOR_DEFAULT_IMAGES: Record<string, string> = {
  "laboratoire-biologie-medicale":
    "https://images.unsplash.com/photo-1579154204601-01588f351e38?auto=format&fit=crop&w=1200&q=80",
  "entreprise-agroalimentaire":
    "https://images.unsplash.com/photo-1566645876731-bbfca2ee4e70?auto=format&fit=crop&w=1200&q=80",
  universite:
    "https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=1200&q=80",
  clinique:
    "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=1200&q=80",
  pharma:
    "https://images.unsplash.com/photo-1582719471130-be2718ec2d44?auto=format&fit=crop&w=1200&q=80",
};

export async function getFormationTypes() {
  try {
    const types = await prisma.formationType.findMany({
      where: { active: true },
      orderBy: { order: "asc" },
    });
    // Successful query: honor empty result when all formations are deactivated.
    return types.map((t) => t.name);
  } catch {
    return [...FALLBACK_FORMATIONS];
  }
}

export async function getFormationTypesFull() {
  try {
    return await prisma.formationType.findMany({ orderBy: { order: "asc" } });
  } catch {
    return [];
  }
}
