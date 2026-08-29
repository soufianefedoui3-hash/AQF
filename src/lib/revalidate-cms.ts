import { revalidatePath } from "next/cache";

/** Public routes that surface CMS content. */
export const CMS_PUBLIC_PATHS = [
  "/",
  "/a-propos",
  "/secteurs",
  "/services",
  "/services/formation",
  "/services/produits",
  "/services/accompagnement",
  "/services/audit",
  "/carrieres",
  "/actualites",
] as const;

export type CmsSection =
  | "about"
  | "team"
  | "sector"
  | "careers"
  | "settings"
  | "page"
  | "ged"
  | "formations"
  | "packs"
  | "news"
  | "all";

const SECTION_PATHS: Record<CmsSection, readonly string[]> = {
  about: ["/a-propos"],
  team: ["/a-propos"],
  sector: ["/secteurs", "/services/accompagnement"],
  careers: ["/carrieres"],
  settings: ["/", "/a-propos", "/carrieres"], // layout footer + WhatsApp
  page: ["/", "/services/formation"],
  ged: ["/services/produits"],
  formations: ["/services/formation"],
  packs: ["/services/produits"],
  news: ["/actualites"],
  all: CMS_PUBLIC_PATHS,
};

/**
 * Bust Next.js cache for public pages after admin CMS mutations.
 * Always revalidates layout so Footer / WhatsApp pick up settings.
 */
export function revalidateCms(section: CmsSection = "all") {
  const paths = new Set<string>(SECTION_PATHS[section] || CMS_PUBLIC_PATHS);
  // Layout-level consumers (footer, WhatsApp) need a broad refresh for settings.
  if (section === "settings" || section === "all") {
    for (const path of CMS_PUBLIC_PATHS) paths.add(path);
  }

  for (const path of paths) {
    try {
      revalidatePath(path);
    } catch (error) {
      console.warn(`[revalidate] Failed for ${path}:`, error);
    }
  }

  // Revalidate nested dynamic sector / article routes by layout segment.
  try {
    revalidatePath("/secteurs", "layout");
    revalidatePath("/actualites", "layout");
    revalidatePath("/", "layout");
  } catch {
    /* ignore */
  }
}
