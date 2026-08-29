import { prisma } from "@/lib/prisma";
import { BRAND, PRODUCT_PACKS } from "@/lib/constants";
import { SECTOR_DEFAULT_IMAGES } from "@/lib/formations";
import { normalizeImageUrl } from "@/lib/news";
import { liveCmsQuery, safeCmsQuery } from "@/lib/cms-live";
import {
  PLACEHOLDER_GENERIC,
  localSectorImage,
  sanitizePublicImageUrl,
} from "@/lib/placeholder-images";

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

export async function getPageContent(key: string, fallback: { title?: string; content: string }) {
  const page = await safeCmsQuery(
    () => prisma.pageContent.findUnique({ where: { key } }),
    null
  );
  return page || { key, title: fallback.title || null, content: fallback.content };
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
    const ged = await liveCmsQuery(() =>
      prisma.gedService.findUnique({ where: { id: "default" } })
    );
    if (!ged) {
      return {
        id: "default",
        title: "GED — Gestion Électronique des Documents",
        description:
          "Notre solution web GED permet de centraliser, structurer et sécuriser l'ensemble de votre documentation qualité. Gestion des versions, traçabilité, workflows de validation et accès contrôlé — le tout conforme aux exigences ISO.",
        imageUrl: null as string | null,
      };
    }

    return {
      ...ged,
      imageUrl: sanitizePublicImageUrl(ged.imageUrl),
    };
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
    const packs = await liveCmsQuery(() =>
      prisma.productPack.findMany({
        where: { active: true },
        orderBy: { order: "asc" },
      })
    );

    return packs
      .filter((pack) => pack.name?.trim())
      .map((pack) => ({
        id: pack.id,
        name: pack.name.trim(),
        description: pack.description?.trim() || "",
      }));
  } catch {
    return PRODUCT_PACKS.map((pack, index) => ({
      id: `fallback-${index}`,
      name: pack.name,
      description: pack.description,
    }));
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
    const [sections, team] = await liveCmsQuery(() =>
      Promise.all([
        prisma.aboutSection.findMany(),
        prisma.teamMember.findMany({ orderBy: { order: "asc" } }),
      ])
    );

    return {
      presentation: sections.find((s) => s.key === "presentation") || FALLBACK.presentation,
      steps: sections.find((s) => s.key === "steps") || FALLBACK.steps,
      team: team.map((member) => ({
        ...member,
        imageUrl: sanitizePublicImageUrl(member.imageUrl),
      })),
    };
  } catch {
    return { ...FALLBACK, team: [] };
  }
}

export async function getSectors() {
  try {
    return await liveCmsQuery(async () => {
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

      if (mapped.length === 0) {
        const settingsCount = await prisma.siteSettings.count().catch(() => 0);
        if (settingsCount === 0) return [...FALLBACK_SECTORS];
      }

      return mapped;
    });
  } catch {
    return [...FALLBACK_SECTORS];
  }
}

export async function getSectorBySlug(slug: string) {
  const normalized = slug?.trim();
  if (!normalized) return null;

  try {
    return await liveCmsQuery(async () => {
      const sector = await prisma.sector.findUnique({ where: { slug: normalized } });
      if (!sector) return null;

      return {
        ...sector,
        imageUrl: resolveSectorImage(sector.slug, sector.imageUrl),
      };
    });
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

  const settings = await safeCmsQuery(
    () => prisma.careersSettings.findUnique({ where: { id: "default" } }),
    null
  );
  if (!settings) return FALLBACK;

  return {
    title: String(settings.title ?? "").trim() || FALLBACK.title,
    content: String(settings.content ?? "").trim() || FALLBACK.content,
    email: String(settings.email ?? "").trim() || FALLBACK.email,
    phone: String(settings.phone ?? "").trim() || FALLBACK.phone,
  };
}

export async function getPublishedArticles() {
  try {
    const articles = await liveCmsQuery(() =>
      prisma.newsArticle.findMany({
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
      })
    );

    return articles
      .filter((article) => article.slug?.trim() && article.title?.trim())
      .map((article) => ({
        id: article.id,
        title: article.title.trim(),
        slug: article.slug.trim(),
        excerpt: article.excerpt?.trim() || null,
        content: article.content?.trim() || "",
        imageUrl: sanitizePublicImageUrl(article.imageUrl),
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
    return (
      (await liveCmsQuery(() =>
        prisma.siteSettings.findUnique({ where: { id: "default" } })
      )) || FALLBACK
    );
  } catch {
    return FALLBACK;
  }
}
