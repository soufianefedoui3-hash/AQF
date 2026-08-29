/**
 * Local-only image policy — never depend on Unsplash or any external CDN.
 * Allowed paths: /uploads/*, /placeholders/*, /brand/*
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

const LOCAL_IMAGE_PREFIXES = ["/uploads/", "/placeholders/", "/brand/"] as const;

export function isAllowedLocalImageUrl(url: string | null | undefined): boolean {
  if (!url || typeof url !== "string") return false;
  const trimmed = url.trim();
  if (!trimmed.startsWith("/") || trimmed.startsWith("//")) return false;
  return LOCAL_IMAGE_PREFIXES.some((prefix) => trimmed.startsWith(prefix));
}

/** True for http(s), protocol-relative, Unsplash, or any non-allowed local path. */
export function isBrokenExternalImageUrl(url: string | null | undefined): boolean {
  if (!url || typeof url !== "string") return false;
  const trimmed = url.trim();
  if (!trimmed) return false;
  if (/^https?:\/\//i.test(trimmed) || trimmed.startsWith("//")) return true;
  if (/unsplash\.com/i.test(trimmed)) return true;
  const path = trimmed.startsWith("/")
    ? trimmed
    : `/${trimmed.replace(/^\/+/, "")}`;
  return !isAllowedLocalImageUrl(path);
}

/** Normalize to an allowed local path, or null (never returns an external URL). */
export function toLocalImageUrl(url: string | null | undefined): string | null {
  if (!url || typeof url !== "string") return null;
  const trimmed = url.trim();
  if (!trimmed) return null;
  if (/^https?:\/\//i.test(trimmed) || trimmed.startsWith("//")) return null;
  if (/unsplash\.com/i.test(trimmed)) return null;
  const path = trimmed.startsWith("/")
    ? trimmed
    : `/${trimmed.replace(/^\/+/, "")}`;
  return isAllowedLocalImageUrl(path) ? path : null;
}

/** Map a sector slug (or any URL) to a reliable local image path. */
export function localSectorImage(
  slug: string | null | undefined,
  imageUrl?: string | null
): string {
  const local = toLocalImageUrl(imageUrl);
  if (local) return local;

  if (slug && SECTOR_PLACEHOLDER_IMAGES[slug]) {
    return SECTOR_PLACEHOLDER_IMAGES[slug];
  }

  return PLACEHOLDER_GENERIC;
}

/**
 * Rewrite external/disallowed URLs.
 * Default fallback is null so missing images render cleanly (no remote).
 */
export function sanitizePublicImageUrl(
  url: string | null | undefined,
  fallback: string | null = null
): string | null {
  const local = toLocalImageUrl(url);
  if (local) return local;
  if (fallback && isAllowedLocalImageUrl(fallback)) return fallback;
  return null;
}
