import { BRAND, PRODUCT_PACKS } from "@/lib/constants";
import { SECTOR_DEFAULT_IMAGES } from "@/lib/formations";
import { normalizeImageUrl } from "@/lib/news";
import {
  PLACEHOLDER_GENERIC,
  localSectorImage,
  sanitizePublicImageUrl,
} from "@/lib/placeholder-images";
import {
  getCareersRow,
  getCustomPageRow,
  getGedRow,
  getPageLayoutBlocks,
  getNewsBySlug,
  getPageRow,
  getSectorRow,
  getSettingsRow,
  listAboutSections,
  listCustomPages,
  listLabels,
  listSitePages,
  listNews,
  listPacks,
  listPages,
  listSectors,
  listTeamMembers,
} from "@/lib/cms/store";
import { DEFAULT_CONTENT_LABELS } from "@/lib/seed-data";
import { NAV_LINKS, SERVICE_LINKS } from "@/lib/constants";

export const SECTOR_FALLBACK_IMAGE = PLACEHOLDER_GENERIC;
export const FALLBACK_SECTORS = [
  {
    slug: "laboratoire-biologie-medicale",
    name: "Laboratoire de biologie médicale",
    description:
      "Accompagnement ISO 15189, GBEA et bonnes pratiques pour garantir la fiabilité des résultats analytiques.",
    imageUrl: SECTOR_DEFAULT_IMAGES["laboratoire-biologie-medicale"],
    order: 0,
  },
  {
    slug: "entreprise-agroalimentaire",
    name: "Entreprise agroalimentaire",
    description:
      "Mise en conformité ISO 22000, ONSSA et systèmes HACCP pour assurer la sécurité alimentaire.",
    imageUrl: SECTOR_DEFAULT_IMAGES["entreprise-agroalimentaire"],
    order: 1,
  },
  {
    slug: "universite",
    name: "Université",
    description:
      "Structuration des processus qualité, laboratoires de recherche et programmes de formation.",
    imageUrl: SECTOR_DEFAULT_IMAGES.universite,
    order: 2,
  },
  {
    slug: "clinique",
    name: "Clinique",
    description:
      "Optimisation des parcours de soins, gestion de la qualité et conformité réglementaire.",
    imageUrl: SECTOR_DEFAULT_IMAGES.clinique,
    order: 3,
  },
  {
    slug: "pharma",
    name: "Pharma",
    description:
      "Excellence opérationnelle, BPF et systèmes qualité pour l'industrie pharmaceutique.",
    imageUrl: SECTOR_DEFAULT_IMAGES.pharma,
    order: 4,
  },
] as const;

export function resolveSectorImage(slug: string, imageUrl: string | null | undefined) {
  return localSectorImage(slug, imageUrl);
}

export function getStoredSectorImage(imageUrl: string | null | undefined) {
  return normalizeImageUrl(imageUrl);
}

export async function getPageContent(
  key: string,
  fallback: { title?: string; content: string }
) {
  try {
    const page = await getPageRow(key);
    return page || { key, title: fallback.title || null, content: fallback.content };
  } catch {
    return { key, title: fallback.title || null, content: fallback.content };
  }
}

const FALLBACK_HOMEPAGE = {
  key: "homepage_presentation",
  title: "Présentation",
  content: `${BRAND.fullName} est votre partenaire de confiance en management de la qualité, formation professionnelle et audit. Nous accompagnons les laboratoires, entreprises agroalimentaires, universités, cliniques et industries pharmaceutiques vers l'excellence opérationnelle et la conformité aux normes internationales.`,
};

const FALLBACK_FORMATION = {
  key: "formation_intro",
  title: "Formation Qualité",
  content:
    "Nos formations qualité sont conçues sur mesure pour répondre aux besoins des étudiants souhaitant se spécialiser, ainsi que des professionnels de santé et du corporate désireux de renforcer leurs compétences en management de la qualité, normes ISO et bonnes pratiques sectorielles.",
};

async function getPrefixedPageBlocks(
  primaryKey: string,
  extraPrefix: string,
  fallback: { key: string; title: string; content: string }
) {
  try {
    const pages = await listPages();
    const primary = pages.find((page) => page.key === primaryKey);
    const extras = pages
      .filter((page) => page.key.startsWith(extraPrefix))
      .sort((a, b) => a.key.localeCompare(b.key));
    if (!primary && extras.length === 0) return [fallback];
    return primary ? [primary, ...extras] : extras;
  } catch {
    return [fallback];
  }
}

export async function getHomepageSections() {
  return getPrefixedPageBlocks(
    "homepage_presentation",
    "homepage:",
    FALLBACK_HOMEPAGE
  );
}

export async function getHomepagePresentation() {
  const [first] = await getHomepageSections();
  return first;
}

export async function getFormationSections() {
  return getPrefixedPageBlocks("formation_intro", "formation:", FALLBACK_FORMATION);
}

export async function getFormationIntro() {
  const [first] = await getFormationSections();
  return first;
}

export async function getCareersExtraSections() {
  try {
    return (await listPages())
      .filter((page) => page.key.startsWith("careers:"))
      .sort((a, b) => a.key.localeCompare(b.key));
  } catch {
    return [];
  }
}

export async function getGedExtraSections() {
  try {
    return (await listPages())
      .filter((page) => page.key.startsWith("ged:"))
      .sort((a, b) => a.key.localeCompare(b.key));
  } catch {
    return [];
  }
}

export async function getGedService() {
  try {
    const ged = await getGedRow();
    if (!ged) {
      return {
        id: "default",
        title: "GED — Gestion Électronique des Documents",
        description:
          "Notre solution web GED permet de centraliser, structurer et sécuriser l'ensemble de votre documentation qualité. Gestion des versions, traçabilité, workflows de validation et accès contrôlé — le tout conforme aux exigences ISO.",
        imageUrl: null as string | null,
      };
    }
    return { ...ged, imageUrl: sanitizePublicImageUrl(ged.imageUrl) };
  } catch {
    return {
      id: "default",
      title: "GED — Gestion Électronique des Documents",
      description:
        "Notre solution web GED permet de centraliser, structurer et sécuriser l'ensemble de votre documentation qualité.",
      imageUrl: null as string | null,
    };
  }
}

export async function getProductPacks() {
  try {
    const packs = await listPacks(true);
    const mapped = packs
      .filter((pack) => pack.name?.trim())
      .map((pack) => ({
        id: pack.id,
        name: pack.name.trim(),
        description: pack.description?.trim() || "",
      }));
    if (mapped.length > 0) return mapped;
  } catch {
    /* fall through */
  }

  return PRODUCT_PACKS.map((pack, index) => ({
    id: `fallback-${index}`,
    name: pack.name,
    description: pack.description,
  }));
}

export async function getAboutData() {
  const FALLBACK = {
    presentation: {
      key: "presentation",
      title: "Présentation du site",
      content:
        "AQF — Académie de Qualité et de Formation — est un centre d'excellence dédié à l'accompagnement des organisations dans leur démarche qualité.",
    },
    steps: {
      key: "steps",
      title: "Étapes à suivre pour demander un service",
      content:
        "1. Accédez à la page du service souhaité.\n2. Remplissez le formulaire dédié.\n3. Cliquez sur « Demande de confirmation ».\n4. Notre équipe vous contactera dans moins de 24 heures.",
    },
  };

  try {
    const [sections, team] = await Promise.all([
      listAboutSections(),
      listTeamMembers(),
    ]);
    const rank = (key: string) =>
      key === "presentation" ? 0 : key === "steps" ? 1 : 2;
    const sorted = [...sections].sort(
      (a, b) => rank(a.key) - rank(b.key) || a.key.localeCompare(b.key)
    );
    const extras = sorted.filter(
      (section) => section.key !== "presentation" && section.key !== "steps"
    );
    return {
      presentation:
        sections.find((s) => s.key === "presentation") || FALLBACK.presentation,
      steps: sections.find((s) => s.key === "steps") || FALLBACK.steps,
      sections:
        sorted.length > 0
          ? sorted
          : [FALLBACK.presentation, FALLBACK.steps],
      extras,
      team: team.map((member) => ({
        ...member,
        imageUrl: sanitizePublicImageUrl(member.imageUrl),
      })),
    };
  } catch {
    return {
      ...FALLBACK,
      sections: [FALLBACK.presentation, FALLBACK.steps],
      extras: [],
      team: [],
    };
  }
}

export async function getSectors() {
  try {
    const sectors = await listSectors();
    const mapped = sectors
      .filter((sector) => sector.slug?.trim() && sector.name?.trim())
      .map((sector) => ({
        slug: sector.slug.trim(),
        name: sector.name.trim(),
        description:
          sector.description?.trim() || "Description indisponible pour ce secteur.",
        imageUrl: resolveSectorImage(sector.slug, sector.imageUrl),
        order: sector.order ?? 0,
      }));

    if (mapped.length === 0) {
      const settings = await getSettingsRow();
      if (!settings) return [...FALLBACK_SECTORS];
    }

    return mapped;
  } catch {
    return [...FALLBACK_SECTORS];
  }
}

export async function getSectorBySlug(slug: string) {
  const normalized = slug?.trim();
  if (!normalized) return null;

  try {
    const sector = await getSectorRow(normalized);
    if (!sector) return null;
    return {
      ...sector,
      imageUrl: resolveSectorImage(sector.slug, sector.imageUrl),
    };
  } catch {
    const fallback = FALLBACK_SECTORS.find((sector) => sector.slug === normalized);
    if (!fallback) return null;
    return {
      id: `fallback-${fallback.slug}`,
      slug: fallback.slug,
      name: fallback.name,
      description: fallback.description,
      imageUrl: resolveSectorImage(fallback.slug, fallback.imageUrl),
      order: fallback.order,
      updatedAt: new Date(0),
    };
  }
}

export async function getCareersSettings() {
  const FALLBACK = {
    title: "Votre expertise, notre force",
    content:
      "AQF recherche des experts qualité, formateurs, auditeurs et consultants. Joignez votre CV et lettre de motivation.",
    email: "recrutement@aqf.ma",
    phone: "+212 600 000 000",
  };

  try {
    const settings = await getCareersRow();
    if (!settings) return FALLBACK;
    return {
      title: settings.title.trim() || FALLBACK.title,
      content: settings.content.trim() || FALLBACK.content,
      email: settings.email.trim() || FALLBACK.email,
      phone: settings.phone.trim() || FALLBACK.phone,
    };
  } catch {
    return FALLBACK;
  }
}

export async function getPublishedArticles() {
  try {
    const articles = await listNews(true);
    return articles
      .filter((article) => article.slug?.trim() && article.title?.trim())
      .map((article) => ({
        id: article.id,
        title: article.title.trim(),
        slug: article.slug.trim(),
        excerpt: article.excerpt?.trim() || null,
        content: article.content.trim(),
        imageUrl: sanitizePublicImageUrl(article.imageUrl),
        createdAt: article.createdAt.toISOString(),
      }));
  } catch {
    return [];
  }
}

export async function getPublishedArticleBySlug(slug: string) {
  try {
    const article = await getNewsBySlug(slug, true);
    if (!article) return null;
    return {
      ...article,
      imageUrl: sanitizePublicImageUrl(article.imageUrl),
    };
  } catch {
    return null;
  }
}

export async function getContentLabels(): Promise<Record<string, string>> {
  const labels = { ...DEFAULT_CONTENT_LABELS };
  try {
    const rows = await listLabels();
    for (const row of rows) {
      const text = row.label.trim();
      if (text) labels[row.id] = text;
    }
  } catch {
    /* keep fallbacks */
  }
  return labels;
}

export function labelOf(
  labels: Record<string, string>,
  id: string,
  fallback?: string
): string {
  const value = labels[id]?.trim();
  return value || fallback || DEFAULT_CONTENT_LABELS[id] || id;
}

export async function getTabLayoutBlocks(tabId: string) {
  try {
    return await getPageLayoutBlocks(tabId);
  } catch {
    return [];
  }
}

export async function getCustomPages() {
  try {
    return await listCustomPages();
  } catch {
    return [];
  }
}

export async function getCustomPageBySlug(slug: string) {
  const normalized = slug?.trim();
  if (!normalized) return null;
  try {
    return await getCustomPageRow(normalized);
  } catch {
    return null;
  }
}

export async function getNavLinks() {
  try {
    const pages = await listSitePages({ navOnly: true });
    const links = pages
      .filter((page) => page.href.trim())
      .map((page) => ({
        href: page.href.trim(),
        label: page.label.trim() || page.id,
      }));
    if (links.length > 0) return links;
  } catch {
    /* fall through to static defaults */
  }
  const labels = await getContentLabels();
  return NAV_LINKS.map((link) => {
    const id =
      link.href === "/"
        ? "homepage"
        : link.href === "/a-propos"
          ? "about"
          : link.href === "/services"
            ? "services"
            : link.href === "/secteurs"
              ? "sectors"
              : link.href === "/actualites"
                ? "news"
                : link.href === "/carrieres"
                  ? "careers"
                  : "";
    return {
      href: link.href,
      label: id ? labelOf(labels, id, link.label) : link.label,
    };
  });
}

export async function getServiceLinks() {
  const labels = await getContentLabels();
  const byHref: Record<string, string> = {
    "/services/accompagnement": "accompagnement",
    "/services/audit": "audit",
    "/services/produits": "products",
  };
  return SERVICE_LINKS.map((link) => ({
    ...link,
    title: labelOf(labels, byHref[link.href] || "", link.title),
  }));
}

export async function getSiteSettings() {
  const FALLBACK = {
    id: "default",
    whatsappNumber: "+212600000000",
    contactEmail: "contact@aqf.ma",
    contactPhone: "+212 600 000 000",
    address: "Maroc",
    updatedAt: new Date(),
  };

  try {
    return (await getSettingsRow()) || FALLBACK;
  } catch {
    return FALLBACK;
  }
}
