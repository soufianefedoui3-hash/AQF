export const LIVE_PAGE_SUBTITLES: Record<string, string> = {
  about: "Notre mission, notre équipe et notre méthode d'accompagnement.",
  team: "Notre mission, notre équipe et notre méthode d'accompagnement.",
  formation:
    "Des formations adaptées aux étudiants et aux professionnels de santé et du corporate.",
  formations:
    "Des formations adaptées aux étudiants et aux professionnels de santé et du corporate.",
  packs: "Packs d'implémentation prêts à l'emploi et solutions web sur mesure.",
  ged: "Packs d'implémentation prêts à l'emploi et solutions web sur mesure.",
  services: "Des solutions complètes pour votre excellence en qualité, formation et audit.",
  sectors: "Une expertise sectorielle reconnue pour les domaines les plus exigeants.",
  news: "Restez informé des dernières avancées en qualité, formation et réglementation.",
  careers: "Rejoignez AQF et contribuez à l'excellence qualité.",
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
