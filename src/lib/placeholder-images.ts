/**
 * Local placeholder images — never depend on external CDNs like Unsplash.
 */

export const PLACEHOLDER_GENERIC = "/placeholders/sector-generic.svg";

export const SECTOR_PLACEHOLDER_IMAGES: Record<string, string> = {
  "laboratoire-biologie-medicale":
    "/placeholders/sector-laboratoire-biologie-medicale.svg",
  "entreprise-agroalimentaire":
    "/placeholders/sector-entreprise-agroalimentaire.svg",
  universite: "/placeholders/sector-universite.svg",
  clinique: "/placeholders/sector-clinique.svg",
  pharma: "/placeholders/sector-pharma.svg",
};

export function isBrokenExternalImageUrl(url: string | null | undefined): boolean {
  if (!url || typeof url !== "string") return false;
  const trimmed = url.trim().toLowerCase();
  return (
    trimmed.includes("images.unsplash.com") ||
    trimmed.includes("unsplash.com/") ||
    trimmed.includes("source.unsplash.com")
  );
}

/** Map a sector slug (or any URL) to a reliable local image path. */
export function localSectorImage(
  slug: string | null | undefined,
  imageUrl?: string | null
): string {
  if (imageUrl && !isBrokenExternalImageUrl(imageUrl)) {
    const trimmed = imageUrl.trim();
    if (trimmed.startsWith("/") || trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
      return trimmed;
    }
    return `/${trimmed.replace(/^\/+/, "")}`;
  }

  if (slug && SECTOR_PLACEHOLDER_IMAGES[slug]) {
    return SECTOR_PLACEHOLDER_IMAGES[slug];
  }

  return PLACEHOLDER_GENERIC;
}

/** Rewrite broken Unsplash (or empty) URLs to a local placeholder. */
export function sanitizePublicImageUrl(
  url: string | null | undefined,
  fallback: string = PLACEHOLDER_GENERIC
): string | null {
  if (!url || typeof url !== "string") return null;
  const trimmed = url.trim();
  if (!trimmed) return null;
  if (isBrokenExternalImageUrl(trimmed)) return fallback;
  if (trimmed.startsWith("/") || trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    return trimmed;
  }
  return `/${trimmed.replace(/^\/+/, "")}`;
}
