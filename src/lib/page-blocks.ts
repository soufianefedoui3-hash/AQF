import { slugify } from "@/lib/utils";
import { ADMIN_CONTENT_TAB_IDS, DEFAULT_SITE_PAGES } from "@/lib/seed-data";

export const PAGE_BLOCK_TYPES = [
  "heading",
  "paragraph",
  "card",
  "list",
  "cta",
  "alert",
  "quote",
  "grid",
  "faq",
  "divider",
  "video",
  "stats",
] as const;
export type PageBlockType = (typeof PAGE_BLOCK_TYPES)[number];

export const ALERT_TONES = ["info", "warning", "success"] as const;
export type AlertTone = (typeof ALERT_TONES)[number];

export const GRID_COLUMNS = [2, 3] as const;
export type GridColumns = (typeof GRID_COLUMNS)[number];

export const DIVIDER_SPACINGS = ["sm", "md", "lg"] as const;
export type DividerSpacing = (typeof DIVIDER_SPACINGS)[number];

export type TitledItem = {
  title: string;
  content: string;
  imageUrl?: string;
};

export type FaqItem = {
  question: string;
  answer: string;
};

export type StatItem = {
  value: string;
  label: string;
};

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
  imageUrl?: string;
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

export type AlertBlock = {
  id: string;
  type: "alert";
  tone: AlertTone;
  title: string;
  content: string;
};

export type QuoteBlock = {
  id: string;
  type: "quote";
  content: string;
  author: string;
};

export type GridBlock = {
  id: string;
  type: "grid";
  title: string;
  columns: GridColumns;
  items: TitledItem[];
};

export type FaqBlock = {
  id: string;
  type: "faq";
  title: string;
  items: FaqItem[];
};

export type DividerBlock = {
  id: string;
  type: "divider";
  label: string;
  spacing: DividerSpacing;
};

export type VideoBlock = {
  id: string;
  type: "video";
  title: string;
  url: string;
};

export type StatsBlock = {
  id: string;
  type: "stats";
  title: string;
  items: StatItem[];
};

export type PageBlock =
  | HeadingBlock
  | ParagraphBlock
  | CardBlock
  | ListBlock
  | CtaBlock
  | AlertBlock
  | QuoteBlock
  | GridBlock
  | FaqBlock
  | DividerBlock
  | VideoBlock
  | StatsBlock;

export const PAGE_BLOCK_LABELS: Record<PageBlockType, string> = {
  heading: "Titre & Texte",
  paragraph: "Paragraphe",
  card: "Carte / Box en vedette",
  list: "Liste à puces / Points clés",
  cta: "Bouton d'action (CTA)",
  alert: "Alerte / Notification",
  quote: "Citation / Témoignage",
  grid: "Grille 2 ou 3 colonnes",
  faq: "FAQ / Accordéon",
  divider: "Séparateur / Ligne",
  video: "Vidéo / Embed",
  stats: "Statistiques / Chiffres clés",
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

export function clonePageBlock(block: PageBlock): PageBlock {
  const copy = structuredClone(block);
  copy.id = crypto.randomUUID();
  return copy;
}

export function createEmptyBlock(type: PageBlockType): PageBlock {
  const id = crypto.randomUUID();
  switch (type) {
    case "heading":
      return { id, type, title: "Nouveau titre", content: "" };
    case "paragraph":
      return { id, type, content: "" };
    case "card":
      return { id, type, title: "Carte en vedette", content: "", imageUrl: "" };
    case "list":
      return { id, type, title: "Points clés", items: [""] };
    case "cta":
      return { id, type, label: "Nous contacter", href: "/services" };
    case "alert":
      return {
        id,
        type,
        tone: "info",
        title: "Information",
        content: "Votre message d'alerte.",
      };
    case "quote":
      return {
        id,
        type,
        content: "Une citation ou un témoignage client.",
        author: "Nom du client",
      };
    case "grid":
      return {
        id,
        type,
        title: "Points forts",
        columns: 3,
        items: [
          { title: "Atout 1", content: "Description courte." },
          { title: "Atout 2", content: "Description courte." },
          { title: "Atout 3", content: "Description courte." },
        ],
      };
    case "faq":
      return {
        id,
        type,
        title: "Questions fréquentes",
        items: [{ question: "Votre question ?", answer: "La réponse." }],
      };
    case "divider":
      return { id, type, label: "", spacing: "md" };
    case "video":
      return { id, type, title: "", url: "" };
    case "stats":
      return {
        id,
        type,
        title: "Chiffres clés",
        items: [
          { value: "200+", label: "Clients" },
          { value: "15+", label: "Années d'expertise" },
          { value: "24h", label: "Délai de réponse" },
        ],
      };
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
    return {
      id,
      type,
      title: asText(rec.title),
      content: asText(rec.content),
      imageUrl: asText(rec.imageUrl),
    };
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
  if (type === "alert") {
    const tone = ALERT_TONES.includes(rec.tone as AlertTone)
      ? (rec.tone as AlertTone)
      : "info";
    return { id, type, tone, title: asText(rec.title), content: asText(rec.content) };
  }
  if (type === "quote") {
    return { id, type, content: asText(rec.content), author: asText(rec.author) };
  }
  if (type === "grid") {
    const columns = rec.columns === 2 ? 2 : 3;
    return {
      id,
      type,
      title: asText(rec.title),
      columns,
      items: parseTitledItems(rec.items),
    };
  }
  if (type === "faq") {
    return { id, type, title: asText(rec.title), items: parseFaqItems(rec.items) };
  }
  if (type === "divider") {
    const spacing = DIVIDER_SPACINGS.includes(rec.spacing as DividerSpacing)
      ? (rec.spacing as DividerSpacing)
      : "md";
    return { id, type, label: asText(rec.label), spacing };
  }
  if (type === "video") {
    return { id, type, title: asText(rec.title), url: asText(rec.url) };
  }
  if (type === "stats") {
    return { id, type, title: asText(rec.title), items: parseStatItems(rec.items) };
  }
  return null;
}

function parseTitledItems(value: unknown): TitledItem[] {
  if (!Array.isArray(value)) return [];
  return value.map((item) => {
    if (!item || typeof item !== "object") {
      return { title: asText(item), content: "" };
    }
    const rec = item as Record<string, unknown>;
    return {
      title: asText(rec.title),
      content: asText(rec.content),
      imageUrl: asText(rec.imageUrl),
    };
  });
}

function parseFaqItems(value: unknown): FaqItem[] {
  if (!Array.isArray(value)) return [];
  return value.map((item) => {
    if (!item || typeof item !== "object") {
      return { question: asText(item), answer: "" };
    }
    const rec = item as Record<string, unknown>;
    return {
      question: asText(rec.question || rec.title),
      answer: asText(rec.answer || rec.content),
    };
  });
}

function parseStatItems(value: unknown): StatItem[] {
  if (!Array.isArray(value)) return [];
  return value.map((item) => {
    if (!item || typeof item !== "object") {
      return { value: asText(item), label: "" };
    }
    const rec = item as Record<string, unknown>;
    return { value: asText(rec.value || rec.title), label: asText(rec.label || rec.content) };
  });
}

function safeYoutubeId(value: string | null | undefined): string | null {
  if (!value) return null;
  const id = value.split(/[?#&]/)[0];
  return /^[\w-]{6,20}$/.test(id) ? id : null;
}

/** Returns a safe YouTube/Vimeo embed URL, or null. */
export function mediaEmbedUrl(raw: string): string | null {
  const value = raw.trim();
  if (!value) return null;
  try {
    const url = new URL(value);
    if (url.protocol !== "http:" && url.protocol !== "https:") return null;
    const host = url.hostname.replace(/^www\./, "");
    if (host === "youtu.be") {
      const id = safeYoutubeId(url.pathname.replace(/^\//, "").split("/")[0]);
      return id ? `https://www.youtube.com/embed/${id}` : null;
    }
    if (host === "youtube.com" || host === "m.youtube.com" || host === "youtube-nocookie.com") {
      const id = safeYoutubeId(
        url.searchParams.get("v") ||
          url.pathname.split("/").find((part, index, parts) => parts[index - 1] === "embed") ||
          url.pathname.split("/").find((part, index, parts) => parts[index - 1] === "shorts")
      );
      return id ? `https://www.youtube.com/embed/${id}` : null;
    }
    if (host === "vimeo.com" || host === "player.vimeo.com") {
      const id = url.pathname.split("/").filter(Boolean).pop();
      return id && /^\d{6,12}$/.test(id) ? `https://player.vimeo.com/video/${id}` : null;
    }
    return null;
  } catch {
    return null;
  }
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
