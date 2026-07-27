export const BRAND = {
  name: "AQF",
  fullName: "Académie de Qualité et de Formation",
  tagline: "Votre partenaire d'excellence en Qualité, Formation et Audit",
  description:
    "Solutions sur mesure pour laboratoires de biologie médicale, entreprises agroalimentaires, universités, cliniques et industrie pharmaceutique.",
} as const;

export const NAV_LINKS = [
  { href: "/", label: "Accueil" },
  { href: "/a-propos", label: "À propos" },
  { href: "/services", label: "Services" },
  { href: "/secteurs", label: "Secteurs" },
  { href: "/actualites", label: "Actualités" },
  { href: "/carrieres", label: "Carrières" },
] as const;

export const SERVICE_LINKS = [
  {
    href: "/services/accompagnement",
    title: "Accompagnement",
    description: "Accompagnement des entreprises et laboratoires",
  },
  {
    href: "/services/formation",
    title: "Formation Qualité",
    description: "Formations sur mesure pour étudiants et professionnels",
  },
  {
    href: "/services/audit",
    title: "Audit",
    description: "Audits internes, blancs et de certification",
  },
  {
    href: "/services/produits",
    title: "Produits & Services",
    description: "Packs d'implémentation et solutions web GED",
  },
] as const;

export const HOMEPAGE_STATS = [
  { value: "200+", label: "Clients accompagnés" },
  { value: "50+", label: "Partenariats actifs" },
  { value: "15+", label: "Années d'expertise" },
  { value: "24h", label: "Délai de réponse" },
] as const;

export const AUDIT_NATURES = [
  "Audit interne",
  "Audit de certification",
  "Audit de surveillance",
  "Audit blanc (mock audit)",
  "Audit de suivi",
  "Autre",
] as const;

export const STANDARD_NORMS = [
  "ISO 9001",
  "ISO 15189",
  "ISO 17025",
  "ISO 22000",
  "ISO 14001",
  "GBEA",
  "ONSSA",
  "ISO 13189",
] as const;

export const PRODUCT_PACKS = [
  { name: "ISO 9001", description: "Pack d'implémentation complet pour la gestion de la qualité." },
  { name: "ISO 15189", description: "Pack spécialisé pour laboratoires de biologie médicale." },
  { name: "ISO 17025", description: "Pack pour laboratoires d'essais et d'étalonnage." },
  { name: "ISO 22000", description: "Pack sécurité alimentaire pour l'agroalimentaire." },
  { name: "ISO 14001", description: "Pack management environnemental." },
  { name: "GBEA", description: "Guide Bonnes Exercices d'Analyse — accompagnement complet." },
  { name: "ONSSA", description: "Conformité réglementaire agroalimentaire Maroc." },
  { name: "ISO 13189", description: "Pack norme spécialisée pour votre secteur." },
] as const;

export const FORMATION_BENEFITS = [
  "Formation de la norme",
  "Support de formation",
  "Manuel qualité de la norme",
  "Système documentaire prêt à appliquer",
  "Attestation",
  "Possibilité de passer stage d'accompagnement",
  "Des séances enregistrées",
] as const;

export const FORMATION_TYPES = [
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

export const APPOINTMENT_TIMES = [
  "09:00", "10:00", "11:00", "14:00", "15:00", "16:00", "17:00",
] as const;

export const SOCIAL_LINKS = [
  { name: "LinkedIn", href: "https://linkedin.com" },
  { name: "Facebook", href: "https://facebook.com" },
  { name: "Instagram", href: "https://instagram.com" },
] as const;

export const SECTOR_ICONS: Record<string, string> = {
  "laboratoire-biologie-medicale": "microscope",
  "entreprise-agroalimentaire": "wheat",
  universite: "graduation",
  clinique: "heart",
  pharma: "pill",
};
