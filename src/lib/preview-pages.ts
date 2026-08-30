import { SITE_COPY_DEFAULTS } from "@/lib/site-copy";

export const LIVE_PAGE_SUBTITLES: Record<string, string> = {
  about: SITE_COPY_DEFAULTS.subtitle_about,
  team: SITE_COPY_DEFAULTS.subtitle_team,
  formation: SITE_COPY_DEFAULTS.subtitle_formation,
  formations: SITE_COPY_DEFAULTS.subtitle_formations,
  packs: SITE_COPY_DEFAULTS.subtitle_packs,
  ged: SITE_COPY_DEFAULTS.subtitle_ged,
  services: SITE_COPY_DEFAULTS.subtitle_services,
  sectors: SITE_COPY_DEFAULTS.subtitle_sectors,
  news: SITE_COPY_DEFAULTS.subtitle_news,
  careers: SITE_COPY_DEFAULTS.subtitle_careers,
};

export function livePageHref(tabId: string, fallback?: string): string | undefined {
  if (tabId === "homepage") return "/";
  if (tabId === "about" || tabId === "team") return "/a-propos";
  if (tabId === "formation" || tabId === "formations") return "/services/formation";
  if (tabId === "packs" || tabId === "ged") return "/services/produits";
  return fallback;
}

export function liveHeroTab(tabId: string): string {
  if (tabId === "team") return "about";
  if (tabId === "formations") return "formation";
  if (tabId === "ged") return "packs";
  return tabId;
}
