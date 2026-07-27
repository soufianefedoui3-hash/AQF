import Link from "next/link";
import { Calendar, ArrowRight } from "lucide-react";
import { ArticleImage } from "@/components/news/ArticleImage";
import { formatDate } from "@/lib/utils";
import { getArticleExcerpt } from "@/lib/news";

interface ArticleCardProps {
  id: string;
  title: string;
  slug: string;
  excerpt?: string | null;
  content?: string | null;
  imageUrl?: string | null;
  createdAt: Date | string;
}

export function ArticleCard({
  title,
  slug,
  excerpt,
  content,
  imageUrl,
  createdAt,
}: ArticleCardProps) {
  const safeTitle = title?.trim() || "Sans titre";
  const description = getArticleExcerpt({ excerpt, content });

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-primary-100 bg-white shadow-sm transition hover:-translate-y-1 hover:border-accent-200 hover:shadow-lg hover:shadow-accent-400/10">
      <div className="relative h-48 shrink-0 overflow-hidden">
        <ArticleImage src={imageUrl} alt={safeTitle} />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-primary-900/40 to-transparent" />
      </div>

      <div className="flex flex-1 flex-col p-6">
        <div className="mb-2 flex items-center gap-2 text-xs text-text-muted">
          <Calendar className="h-3.5 w-3.5 shrink-0 text-accent-500" />
          <time dateTime={new Date(createdAt).toISOString()}>{formatDate(createdAt)}</time>
        </div>

        <h2 className="mb-2 line-clamp-2 text-lg font-semibold text-primary-900">{safeTitle}</h2>

        <p className="mb-4 line-clamp-3 flex-1 text-sm leading-relaxed text-text-muted">
          {description}
        </p>

        <Link
          href={`/actualites/${slug}`}
          className="inline-flex items-center gap-1 text-sm font-medium text-accent-600 hover:text-accent-700"
        >
          Lire la suite
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </article>
  );
}
