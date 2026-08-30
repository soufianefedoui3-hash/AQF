import { FORMATION_BENEFITS, HOMEPAGE_STATS, SERVICE_LINKS } from "@/lib/constants";

export const SITE_COPY_DEFAULTS: Record<string, string> = {
  hero_tagline: "Votre partenaire d'excellence en Qualité, Formation et Audit",
  subtitle_about: "Notre mission, notre équipe et notre méthode d'accompagnement.",
  subtitle_team: "Notre mission, notre équipe et notre méthode d'accompagnement.",
  subtitle_formation:
    "Des formations adaptées aux étudiants et aux professionnels de santé et du corporate.",
  subtitle_formations:
    "Des formations adaptées aux étudiants et aux professionnels de santé et du corporate.",
  subtitle_packs: "Packs d'implémentation prêts à l'emploi et solutions web sur mesure.",
  subtitle_ged: "Packs d'implémentation prêts à l'emploi et solutions web sur mesure.",
  subtitle_services: "Des solutions complètes pour votre excellence en qualité, formation et audit.",
  subtitle_sectors: "Une expertise sectorielle reconnue pour les domaines les plus exigeants.",
  subtitle_news: "Restez informé des dernières avancées en qualité, formation et réglementation.",
  subtitle_careers: "Rejoignez AQF et contribuez à l'excellence qualité.",
  explore_title: "Explorez nos services",
  explore_cta: "Découvrir nos services",
  explore_desc_services: "Accompagnement, formation, audit et produits qualité",
  explore_desc_sectors: "Expertise sectorielle pour 5 domaines clés",
  explore_desc_about: "Notre mission, équipe et méthode de travail",
  explore_desc_news: "Dernières nouvelles et mises à jour AQF",
  explore_desc_careers: "Rejoignez notre réseau d'experts qualité",
  service_desc_accompagnement: SERVICE_LINKS[0].description,
  service_desc_formation: SERVICE_LINKS[1].description,
  service_desc_audit: SERVICE_LINKS[2].description,
  service_desc_products: SERVICE_LINKS[3].description,
  service_cta: "Accéder",
  formation_benefits_title: "Ce que comprend chaque formation",
  formation_benefits: FORMATION_BENEFITS.join("\n"),
  formation_enroll_title: "Inscription à une formation",
  formation_empty: "Aucune formation disponible pour le moment.",
  products_packs_badge: "Partie 1",
  products_packs_subtitle: "Des packs complets, prêts à déployer, pour chaque norme clé.",
  products_ged_badge: "Partie 2",
  products_ged_subtitle: "Solution GED développée par AQF pour la gestion documentaire qualité.",
  products_ged_fallback: "Gestion Électronique des Documents",
  products_empty: "Aucun pack disponible pour le moment.",
  sectors_discover: "Découvrir",
  sectors_empty_desc: "Description indisponible pour ce secteur.",
  careers_email_label: "Email de candidature",
  careers_phone_label: "Numéro de téléphone",
  footer_tagline: "Excellence en qualité, formation et audit pour les secteurs les plus exigeants.",
  footer_nav: "Navigation",
  footer_services: "Services",
  footer_contact: "Contact",
  footer_copyright: "Tous droits réservés.",
  back_to_services: "Retour aux services",
  news_empty: "Aucun article publié pour le moment.",
  stat_1_value: HOMEPAGE_STATS[0].value,
  stat_1_label: HOMEPAGE_STATS[0].label,
  stat_2_value: HOMEPAGE_STATS[1].value,
  stat_2_label: HOMEPAGE_STATS[1].label,
  stat_3_value: HOMEPAGE_STATS[2].value,
  stat_3_label: HOMEPAGE_STATS[2].label,
  stat_4_value: HOMEPAGE_STATS[3].value,
  stat_4_label: HOMEPAGE_STATS[3].label,
};

export const STAT_INDEXES = [1, 2, 3, 4] as const;

export function subtitleKey(tabId: string): string {
  return `subtitle_${tabId}`;
}

export function serviceDescKey(href: string): string {
  if (href.includes("accompagnement")) return "service_desc_accompagnement";
  if (href.includes("audit")) return "service_desc_audit";
  if (href.includes("produits")) return "service_desc_products";
  return "service_desc_formation";
}

export function exploreDescKey(href: string): string {
  if (href === "/services") return "explore_desc_services";
  if (href === "/secteurs") return "explore_desc_sectors";
  if (href === "/a-propos") return "explore_desc_about";
  if (href === "/actualites") return "explore_desc_news";
  return "explore_desc_careers";
}

export function resolveCopy(
  labels: Record<string, string>,
  id: string,
  fallback?: string
): string {
  if (Object.prototype.hasOwnProperty.call(labels, id)) {
    return String(labels[id] ?? "");
  }
  return fallback ?? SITE_COPY_DEFAULTS[id] ?? "";
}

export function homepageStatsFromLabels(labels: Record<string, string>) {
  return STAT_INDEXES.map((index) => ({
    value: resolveCopy(labels, `stat_${index}_value`),
    label: resolveCopy(labels, `stat_${index}_label`),
  })).filter((stat) => stat.value.trim() || stat.label.trim());
}

export function formationBenefitsFromLabels(labels: Record<string, string>): string[] {
  return resolveCopy(labels, "formation_benefits")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}
