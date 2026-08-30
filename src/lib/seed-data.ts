import { SITE_COPY_DEFAULTS } from "@/lib/site-copy";

export const DEFAULT_SECTORS = [
  {
    slug: "laboratoire-biologie-medicale",
    name: "Laboratoire de biologie médicale",
    description:
      "Accompagnement ISO 15189, GBEA et bonnes pratiques pour garantir la fiabilité des résultats analytiques et la conformité réglementaire.",
    imageUrl: "/placeholders/sector-laboratoire-biologie-medicale.svg",
    order: 0,
  },
  {
    slug: "entreprise-agroalimentaire",
    name: "Entreprise agroalimentaire",
    description:
      "Mise en conformité ISO 22000, ONSSA et systèmes HACCP pour assurer la sécurité alimentaire de vos produits.",
    imageUrl: "/placeholders/sector-entreprise-agroalimentaire.svg",
    order: 1,
  },
  {
    slug: "universite",
    name: "Université",
    description:
      "Structuration des processus qualité, laboratoires de recherche et programmes de formation pour l'enseignement supérieur.",
    imageUrl: "/placeholders/sector-universite.svg",
    order: 2,
  },
  {
    slug: "clinique",
    name: "Clinique",
    description:
      "Optimisation des parcours de soins, gestion de la qualité et conformité réglementaire pour les établissements de santé.",
    imageUrl: "/placeholders/sector-clinique.svg",
    order: 3,
  },
  {
    slug: "pharma",
    name: "Pharma",
    description:
      "Excellence opérationnelle, BPF et systèmes qualité pour l'industrie pharmaceutique et dispositifs médicaux.",
    imageUrl: "/placeholders/sector-pharma.svg",
    order: 4,
  },
] as const;

export const DEFAULT_FORMATION_TYPES = [
  "ISO 9001",
  "ISO 17025",
  "ISO 15189",
  "ISO 22000",
  "ISO 13485",
  "ISO 14001",
  "ONSSA",
  "Certification HALAL",
  "SMETA",
] as const;

export const DEFAULT_ABOUT_SECTIONS = [
  {
    key: "presentation",
    title: "Présentation du site",
    content:
      "AQF — Académie de Qualité et de Formation — est un centre d'excellence dédié à l'accompagnement des organisations dans leur démarche qualité. Nous intervenons auprès des laboratoires de biologie médicale, entreprises agroalimentaires, universités, cliniques et industries pharmaceutiques.\n\nNotre mission est de garantir la conformité aux normes internationales (ISO 9001, ISO 15189, ISO 17025, ISO 22000, etc.) tout en favorisant l'amélioration continue et la compétitivité de nos clients.",
  },
  {
    key: "steps",
    title: "Étapes à suivre pour demander un service",
    content:
      "1. Accédez à la page du service souhaité via le menu Services.\n\n2. Remplissez le formulaire dédié.\n\n3. Cliquez sur « Demande de confirmation ».\n\n4. Notre équipe AQF vous contactera dans un délai inférieur à 24 heures.",
  },
] as const;

export const DEFAULT_TEAM_MEMBERS = [
  {
    name: "Dr. Karim El Amrani",
    role: "Directeur Qualité & Audits",
    skills: "ISO 15189, ISO 17025, Audits internes, GBEA, Certification",
    order: 0,
  },
  {
    name: "Sara Benali",
    role: "Responsable Formation",
    skills: "Formation ISO 9001, ISO 22000, Pédagogie qualité, E-learning",
    order: 1,
  },
  {
    name: "Youssef Tazi",
    role: "Consultant Digital & Web",
    skills: "Solutions web qualité, Dashboards, Automatisation, ISO digitale",
    order: 2,
  },
] as const;

export const DEFAULT_CAREERS_SETTINGS = {
  id: "default",
  title: "Rejoignez une équipe passionnée par la qualité",
  content:
    "AQF recherche des experts qualité, formateurs, auditeurs et consultants pour renforcer son réseau national. Si vous partagez notre vision de l'excellence et souhaitez contribuer à l'amélioration des organisations, nous serions ravis de recevoir votre candidature.\n\nMerci de joindre votre CV et votre lettre de motivation via le formulaire ci-contre ou par email direct.",
  email: "recrutement@aqf.ma",
  phone: "+212 600 000 000",
} as const;

export const DEFAULT_SITE_SETTINGS = {
  id: "default",
  whatsappNumber: "+212600000000",
  contactEmail: "contact@aqf.ma",
  contactPhone: "+212 600 000 000",
  address: "Maroc",
} as const;

export const DEFAULT_PAGE_CONTENT = [
  {
    key: "homepage_presentation",
    title: "Présentation",
    content:
      "AQF — Académie de Qualité et de Formation — est votre partenaire de confiance en management de la qualité, formation professionnelle et audit. Nous accompagnons les laboratoires, entreprises agroalimentaires, universités, cliniques et industries pharmaceutiques vers l'excellence opérationnelle.",
  },
  {
    key: "formation_intro",
    title: "Formation Qualité",
    content:
      "Nos formations qualité sont conçues sur mesure pour répondre aux besoins des étudiants souhaitant se spécialiser, ainsi que des professionnels de santé et du corporate désireux de renforcer leurs compétences en management de la qualité, normes ISO et bonnes pratiques sectorielles.",
  },
] as const;

export const DEFAULT_GED_SERVICE = {
  id: "default",
  title: "GED — Gestion Électronique des Documents",
  description:
    "Notre solution web GED permet de centraliser, structurer et sécuriser l'ensemble de votre documentation qualité. Gestion des versions, traçabilité, workflows de validation et accès contrôlé — le tout conforme aux exigences ISO.\n\nDéveloppée par AQF, cette plateforme s'adapte à vos processus métier et facilite la préparation aux audits et certifications.",
  imageUrl: null as string | null,
} as const;

export const DEFAULT_NEWS_ARTICLE = {
  title: "AQF lance son nouveau programme de formation ISO 15189",
  slug: "aqf-lance-programme-iso-15189",
  excerpt:
    "Un programme complet dédié aux laboratoires de biologie médicale souhaitant obtenir la certification ISO 15189.",
  content:
    "L'Académie de Qualité et de Formation (AQF) est fière d'annoncer le lancement de son nouveau programme de formation ISO 15189, spécialement conçu pour les laboratoires de biologie médicale.\n\nCe programme couvre l'ensemble des exigences de la norme, de la structuration documentaire à la préparation à l'audit de certification. Nos formateurs experts vous accompagnent à chaque étape.\n\nInscrivez-vous dès maintenant via notre formulaire de formation qualité.",
  published: true,
  imageUrl: null as string | null,
} as const;

export const DEFAULT_PRODUCT_PACKS = [
  { name: "ISO 9001", description: "Pack d'implémentation complet pour la gestion de la qualité.", order: 0 },
  { name: "ISO 15189", description: "Pack spécialisé pour laboratoires de biologie médicale.", order: 1 },
  { name: "ISO 17025", description: "Pack pour laboratoires d'essais et d'étalonnage.", order: 2 },
  { name: "ISO 22000", description: "Pack sécurité alimentaire pour l'agroalimentaire.", order: 3 },
  { name: "ISO 14001", description: "Pack management environnemental.", order: 4 },
  { name: "GBEA", description: "Guide Bonnes Exercices d'Analyse — accompagnement complet.", order: 5 },
  { name: "ONSSA", description: "Conformité réglementaire agroalimentaire Maroc.", order: 6 },
  { name: "ISO 13189", description: "Pack norme spécialisée pour votre secteur.", order: 7 },
] as const;

/** Stable ids for admin content tabs + public nav/headings. */
export const DEFAULT_CONTENT_LABELS: Record<string, string> = {
  homepage: "Accueil",
  about: "À propos",
  formation: "Formation (texte)",
  formations: "Formations disponibles",
  packs: "Packs produits",
  ged: "GED",
  team: "Équipe",
  sectors: "Secteurs",
  careers: "Carrières",
  settings: "Paramètres",
  services: "Services",
  news: "Actualités",
  accompagnement: "Accompagnement",
  audit: "Audit",
  products: "Produits & Services",
  ...SITE_COPY_DEFAULTS,
};

export const ADMIN_CONTENT_TAB_IDS = [
  "about",
  "homepage",
  "formation",
  "formations",
  "packs",
  "ged",
  "team",
  "sectors",
  "careers",
  "settings",
  "services",
  "news",
] as const;

export const DEFAULT_SITE_PAGES = [
  { id: "homepage", label: "Accueil", href: "/", showInNav: true, sortOrder: 0, adminTab: true },
  { id: "about", label: "À propos", href: "/a-propos", showInNav: true, sortOrder: 1, adminTab: true },
  { id: "services", label: "Services", href: "/services", showInNav: true, sortOrder: 2, adminTab: true },
  { id: "sectors", label: "Secteurs", href: "/secteurs", showInNav: true, sortOrder: 3, adminTab: true },
  { id: "news", label: "Actualités", href: "/actualites", showInNav: true, sortOrder: 4, adminTab: true },
  { id: "careers", label: "Carrières", href: "/carrieres", showInNav: true, sortOrder: 5, adminTab: true },
  { id: "formation", label: "Formation (texte)", href: "/services/formation", showInNav: false, sortOrder: 10, adminTab: true },
  { id: "formations", label: "Formations disponibles", href: "/services/formation", showInNav: false, sortOrder: 11, adminTab: true },
  { id: "packs", label: "Packs produits", href: "/services/produits", showInNav: false, sortOrder: 12, adminTab: true },
  { id: "ged", label: "GED", href: "/services/produits", showInNav: false, sortOrder: 13, adminTab: true },
  { id: "team", label: "Équipe", href: "/a-propos", showInNav: false, sortOrder: 14, adminTab: true },
  { id: "settings", label: "Paramètres", href: "", showInNav: false, sortOrder: 99, adminTab: true },
] as const;

export const PUBLIC_NAV_LABEL_IDS = [
  "services",
  "news",
  "accompagnement",
  "audit",
  "products",
] as const;

/** Static fallback for admin content API when SQLite is unavailable. */
export const DEFAULT_ADMIN_CONTENT = {
  about: DEFAULT_ABOUT_SECTIONS.map((section, index) => ({
    id: `default-about-${index}`,
    key: section.key,
    title: section.title,
    content: section.content,
    updatedAt: new Date(0),
  })),
  team: [] as Array<{
    id: string;
    name: string;
    role: string;
    skills: string;
    imageUrl: string | null;
    order: number;
    updatedAt: Date;
  }>,
  sectors: DEFAULT_SECTORS.map((sector, index) => ({
    id: `default-sector-${index}`,
    slug: sector.slug,
    name: sector.name,
    description: sector.description,
    imageUrl: sector.imageUrl,
    order: sector.order,
    updatedAt: new Date(0),
  })),
  careers: {
    id: "default",
    title: DEFAULT_CAREERS_SETTINGS.title,
    content: DEFAULT_CAREERS_SETTINGS.content,
    email: DEFAULT_CAREERS_SETTINGS.email,
    phone: DEFAULT_CAREERS_SETTINGS.phone,
    updatedAt: new Date(0),
  },
  settings: {
    id: "default",
    whatsappNumber: DEFAULT_SITE_SETTINGS.whatsappNumber,
    contactEmail: DEFAULT_SITE_SETTINGS.contactEmail,
    contactPhone: DEFAULT_SITE_SETTINGS.contactPhone,
    address: DEFAULT_SITE_SETTINGS.address,
    updatedAt: new Date(0),
  },
  pages: DEFAULT_PAGE_CONTENT.map((page, index) => ({
    id: `default-page-${index}`,
    key: page.key,
    title: page.title,
    content: page.content,
    updatedAt: new Date(0),
  })),
  ged: {
    id: "default",
    title: DEFAULT_GED_SERVICE.title,
    description: DEFAULT_GED_SERVICE.description,
    imageUrl: DEFAULT_GED_SERVICE.imageUrl,
    updatedAt: new Date(0),
  },
  labels: { ...DEFAULT_CONTENT_LABELS },
  sitePages: DEFAULT_SITE_PAGES.map((page) => ({
    id: page.id,
    label: page.label,
    href: page.href,
    showInNav: page.showInNav,
    sortOrder: page.sortOrder,
    kind: "system" as const,
    adminTab: page.adminTab,
    deleted: false,
  })),
  layouts: {} as Record<string, unknown[]>,
  customPages: [] as Array<{
    id: string;
    slug: string;
    title: string;
    showInNav: boolean;
    sortOrder: number;
    blocks: unknown[];
    updatedAt: Date;
  }>,
};
