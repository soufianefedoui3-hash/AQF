import { prisma } from "@/lib/prisma";
import { BRAND, PRODUCT_PACKS } from "@/lib/constants";
import { SECTOR_DEFAULT_IMAGES } from "@/lib/formations";
import { normalizeImageUrl } from "@/lib/news";

export const SECTOR_FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=1200&q=80";

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
  const normalized = normalizeImageUrl(imageUrl);
  return normalized || SECTOR_DEFAULT_IMAGES[slug] || SECTOR_FALLBACK_IMAGE;
}

export async function getPageContent(key: string, fallback: { title?: string; content: string }) {
  try {
    const page = await prisma.pageContent.findUnique({ where: { key } });
    return page || { key, title: fallback.title || null, content: fallback.content };
  } catch {
    return { key, title: fallback.title || null, content: fallback.content };
  }
}

export async function getHomepagePresentation() {
  return getPageContent("homepage_presentation", {
    title: "Présentation",
    content: `${BRAND.fullName} est votre partenaire de confiance en management de la qualité, formation professionnelle et audit. Nous accompagnons les laboratoires, entreprises agroalimentaires, universités, cliniques et industries pharmaceutiques vers l'excellence opérationnelle et la conformité aux normes internationales.`,
  });
}

export async function getFormationIntro() {
  return getPageContent("formation_intro", {
    title: "Formation Qualité",
    content:
      "Nos formations qualité sont conçues sur mesure pour répondre aux besoins des étudiants souhaitant se spécialiser, ainsi que des professionnels de santé et du corporate désireux de renforcer leurs compétences en management de la qualité, normes ISO et bonnes pratiques sectorielles.",
  });
}

export async function getGedService() {
  try {
    const ged = await prisma.gedService.findUnique({ where: { id: "default" } });
    return (
      ged || {
        id: "default",
        title: "GED — Gestion Électronique des Documents",
        description:
          "Notre solution web GED permet de centraliser, structurer et sécuriser l'ensemble de votre documentation qualité. Gestion des versions, traçabilité, workflows de validation et accès contrôlé — le tout conforme aux exigences ISO.",
        imageUrl: null,
      }
    );
  } catch {
    return {
      id: "default",
      title: "GED — Gestion Électronique des Documents",
      description:
        "Notre solution web GED permet de centraliser, structurer et sécuriser l'ensemble de votre documentation qualité.",
      imageUrl: null,
    };
  }
}

export async function getProductPacks() {
  const fallback = PRODUCT_PACKS.map((pack, index) => ({
    id: `fallback-${index}`,
    name: pack.name,
    description: pack.description,
  }));

  try {
    const packs = await prisma.productPack.findMany({
      where: { active: true },
      orderBy: { order: "asc" },
    });

    if (packs.length === 0) return fallback;

    return packs
      .filter((pack) => pack.name?.trim())
      .map((pack) => ({
        id: pack.id,
        name: pack.name.trim(),
        description: pack.description?.trim() || "",
      }));
  } catch {
    return fallback;
  }
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
      prisma.aboutSection.findMany(),
      prisma.teamMember.findMany({ orderBy: { order: "asc" } }),
    ]);

    return {
      presentation: sections.find((s) => s.key === "presentation") || FALLBACK.presentation,
      steps: sections.find((s) => s.key === "steps") || FALLBACK.steps,
      team,
    };
  } catch {
    return { ...FALLBACK, team: [] };
  }
}

export async function getSectors() {
  try {
    const sectors = await prisma.sector.findMany({ orderBy: { order: "asc" } });
    const mapped = sectors
      .filter((sector) => sector.slug?.trim() && sector.name?.trim())
      .map((sector) => ({
        slug: sector.slug.trim(),
        name: sector.name.trim(),
        description: sector.description?.trim() || "Description indisponible pour ce secteur.",
        imageUrl: resolveSectorImage(sector.slug, sector.imageUrl),
        order: sector.order ?? 0,
      }));

    return mapped.length > 0 ? mapped : [...FALLBACK_SECTORS];
  } catch {
    return [...FALLBACK_SECTORS];
  }
}

export async function getSectorBySlug(slug: string) {
  try {
    const sector = await prisma.sector.findUnique({ where: { slug } });
    if (!sector) return null;
    return {
      ...sector,
      imageUrl: resolveSectorImage(sector.slug, sector.imageUrl),
    };
  } catch {
    return null;
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
    const settings = await prisma.careersSettings.findUnique({ where: { id: "default" } });
    if (!settings) return FALLBACK;

    return {
      title: settings.title?.trim() || FALLBACK.title,
      content: settings.content?.trim() || FALLBACK.content,
      email: settings.email?.trim() || FALLBACK.email,
      phone: settings.phone?.trim() || FALLBACK.phone,
    };
  } catch {
    return FALLBACK;
  }
}

export async function getPublishedArticles() {
  try {
    const articles = await prisma.newsArticle.findMany({
      where: { published: true },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        title: true,
        slug: true,
        excerpt: true,
        content: true,
        imageUrl: true,
        createdAt: true,
      },
    });

    return articles
      .filter((article) => article.slug?.trim() && article.title?.trim())
      .map((article) => ({
        id: article.id,
        title: article.title.trim(),
        slug: article.slug.trim(),
        excerpt: article.excerpt?.trim() || null,
        content: article.content?.trim() || "",
        imageUrl: normalizeImageUrl(article.imageUrl),
        createdAt: article.createdAt.toISOString(),
      }));
  } catch {
    return [];
  }
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
    return (await prisma.siteSettings.findUnique({ where: { id: "default" } })) || FALLBACK;
  } catch {
    return FALLBACK;
  }
}
