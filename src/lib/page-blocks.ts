import { slugify } from "@/lib/utils";
import { ADMIN_CONTENT_TAB_IDS, DEFAULT_SITE_PAGES } from "@/lib/seed-data";

export const PAGE_BLOCK_TYPES = [
  "heading",
  "paragraph",
  "card",
  "list",
  "cta",
] as const;
export type PageBlockType = (typeof PAGE_BLOCK_TYPES)[number];

export type HeadingBlock = {
  id: string;
  type: "heading";
  title: string;
  content: string;
};

export type ParagraphBlock = {
  id: string;
  type: "paragraph";
  content: string;
};

export type CardBlock = {
  id: string;
  type: "card";
  title: string;
  content: string;
};

export type ListBlock = {
  id: string;
  type: "list";
  title: string;
  items: string[];
};

export type CtaBlock = {
  id: string;
  type: "cta";
  label: string;
  href: string;
};

export type PageBlock =
  | HeadingBlock
  | ParagraphBlock
  | CardBlock
  | ListBlock
  | CtaBlock;

export const PAGE_BLOCK_LABELS: Record<PageBlockType, string> = {
  heading: "Titre & Texte",
  paragraph: "Paragraphe",
  card: "Carte / Box en vedette",
  list: "Liste à puces / Points clés",
  cta: "Bouton d'action (CTA)",
};

/** First-segment routes and system paths that custom pages must not occupy. */
export const RESERVED_PAGE_SLUGS = new Set([
  "admin",
  "api",
  "a-propos",
  "services",
  "secteurs",
  "actualites",
  "carrieres",
  "login",
  "styles",
  "uploads",
  "assets",
  "_next",
  "favicon.ico",
  "robots.txt",
  "sitemap.xml",
]);

export function isReservedPageSlug(slug: string): boolean {
  return RESERVED_PAGE_SLUGS.has(slug.trim().toLowerCase());
}

export function normalizePageSlug(value: string, fallback = ""): string {
  const slug = slugify(value || fallback).slice(0, 80);
  return slug;
}

export function createEmptyBlock(type: PageBlockType): PageBlock {
  const id = crypto.randomUUID();
  switch (type) {
    case "heading":
      return { id, type, title: "Nouveau titre", content: "" };
    case "paragraph":
      return { id, type, content: "" };
    case "card":
      return { id, type, title: "Carte en vedette", content: "" };
    case "list":
      return { id, type, title: "Points clés", items: [""] };
    case "cta":
      return { id, type, label: "Nous contacter", href: "/services" };
  }
}

function asText(value: unknown): string {
  return typeof value === "string" ? value : value == null ? "" : String(value);
}

function normalizeBlock(value: unknown): PageBlock | null {
  if (!value || typeof value !== "object") return null;
  const rec = value as Record<string, unknown>;
  const type = String(rec.type || "");
  const id =
    typeof rec.id === "string" && rec.id.trim()
      ? rec.id.trim()
      : crypto.randomUUID();

  if (type === "heading") {
    return { id, type, title: asText(rec.title), content: asText(rec.content) };
  }
  if (type === "paragraph") {
    return { id, type, content: asText(rec.content) };
  }
  if (type === "card") {
    return { id, type, title: asText(rec.title), content: asText(rec.content) };
  }
  if (type === "list") {
    const items = Array.isArray(rec.items)
      ? rec.items.map((item) => asText(item))
      : asText(rec.content)
          .split("\n")
          .map((line) => line.trim());
    return { id, type, title: asText(rec.title), items };
  }
  if (type === "cta") {
    return { id, type, label: asText(rec.label || rec.title), href: asText(rec.href) };
  }
  return null;
}

export function parsePageBlocks(raw: unknown): PageBlock[] {
  let parsed = raw;
  if (typeof raw === "string") {
    const trimmed = raw.trim();
    if (!trimmed) return [];
    try {
      parsed = JSON.parse(trimmed);
    } catch {
      return [];
    }
  }
  if (!Array.isArray(parsed)) return [];
  return parsed.map(normalizeBlock).filter((block): block is PageBlock => block !== null);
}

export function serializePageBlocks(blocks: PageBlock[]): string {
  return JSON.stringify(parsePageBlocks(blocks));
}

export const EMPTY_PAGE_BLOCKS: PageBlock[] = [];

export function customPageTabId(id: string): string {
  return `custom:${id}`;
}

export function customPageIdFromTab(tabId: string): string | null {
  return tabId.startsWith("custom:") ? tabId.slice("custom:".length) : null;
}

export function isSystemContentTab(id: string): boolean {
  return (
    (ADMIN_CONTENT_TAB_IDS as readonly string[]).includes(id) ||
    DEFAULT_SITE_PAGES.some((page) => page.id === id)
  );
}

export function isValidLayoutTabId(id: string): boolean {
  const key = id.trim();
  if (!key) return false;
  return key.startsWith("custom:") || isSystemContentTab(key);
}
