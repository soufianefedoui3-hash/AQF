import { toLocalImageUrl } from "@/lib/placeholder-images";

export interface NewsArticleDTO {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  imageUrl: string | null;
  published: boolean;
  createdAt: string;
  updatedAt: string;
}

export function serializeNewsArticle(article: {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  imageUrl: string | null;
  published: boolean;
  createdAt: Date;
  updatedAt: Date;
}): NewsArticleDTO {
  return {
    id: article.id,
    title: article.title.trim(),
    slug: article.slug,
    excerpt: article.excerpt?.trim() || null,
    content: article.content.trim(),
    imageUrl: normalizeImageUrl(article.imageUrl),
    published: article.published,
    createdAt: article.createdAt.toISOString(),
    updatedAt: article.updatedAt.toISOString(),
  };
}

/** Only `/uploads`, `/placeholders`, and `/brand` paths — never external URLs. */
export function normalizeImageUrl(url: string | null | undefined): string | null {
  return toLocalImageUrl(url);
}

export function getArticleExcerpt(
  article: { excerpt?: string | null; content?: string | null },
  maxLength = 150
): string {
  const excerpt = article.excerpt?.trim();
  if (excerpt) return excerpt;

  const content = article.content?.trim() || "";
  if (!content) return "Aucune description disponible.";
  if (content.length <= maxLength) return content;
  return `${content.slice(0, maxLength).trim()}…`;
}

export function splitArticleContent(content: string | null | undefined): string[] {
  if (!content?.trim()) return [];
  return content
    .split(/\r?\n/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);
}

export function isNewsArticleArray(value: unknown): value is NewsArticleDTO[] {
  return Array.isArray(value);
}
