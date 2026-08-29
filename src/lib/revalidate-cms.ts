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

/**
 * Bust Next.js caches aggressively after any admin CMS mutation.
 * Always revalidates every public CMS route (page + layout) so admin
 * edits appear immediately on the website.
 */
export function revalidateCms(_section: CmsSection = "all") {
  for (const path of CMS_PUBLIC_PATHS) {
    try {
      revalidatePath(path);
    } catch (error) {
      console.warn(`[revalidate] ${path}:`, error);
    }
    try {
      revalidatePath(path, "page");
    } catch (error) {
      console.warn(`[revalidate] page ${path}:`, error);
    }
    try {
      revalidatePath(path, "layout");
    } catch (error) {
      console.warn(`[revalidate] layout ${path}:`, error);
    }
  }

  try {
    revalidatePath("/", "layout");
    revalidatePath("/secteurs", "layout");
    revalidatePath("/actualites", "layout");
    revalidatePath("/services", "layout");
    revalidatePath("/admin", "layout");
  } catch {
    /* ignore */
  }
}
