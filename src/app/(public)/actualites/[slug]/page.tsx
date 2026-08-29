import Link from "next/link";
import { ArrowLeft, Calendar } from "lucide-react";
import { notFound } from "next/navigation";
import { PageSection } from "@/components/ui/PageSection";
import { ArticleImage } from "@/components/news/ArticleImage";
import { formatDate } from "@/lib/utils";
import { getArticleExcerpt, splitArticleContent } from "@/lib/news";
import { getPublishedArticleBySlug } from "@/lib/content";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function ArticlePage({ params }: PageProps) {
  const { slug } = await params;

  const article = await getPublishedArticleBySlug(slug);

  if (!article) notFound();

  const title = article.title?.trim() || "Sans titre";
  const paragraphs = splitArticleContent(article.content);
  const summary = getArticleExcerpt(article, 220);

  return (
    <article>
      <PageSection container="3xl" className="border-b border-primary-100 bg-surface-muted py-10 md:py-12">
        <Link
          href="/actualites"
          className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-accent-600 hover:text-accent-700"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour aux actualités
        </Link>

        <div className="mb-4 flex items-center gap-2 text-sm text-text-muted">
          <Calendar className="h-4 w-4 shrink-0 text-accent-500" />
          <time dateTime={article.createdAt.toISOString()}>{formatDate(article.createdAt)}</time>
        </div>

        <h1 className="mb-4 text-3xl font-bold text-primary-900 sm:text-4xl">{title}</h1>

        {summary && (
          <p className="text-lg leading-relaxed text-text-muted">{summary}</p>
        )}
      </PageSection>

      <PageSection container="3xl">
        <div className="relative mb-8 h-56 overflow-hidden rounded-2xl sm:h-72">
          <ArticleImage
            src={article.imageUrl}
            alt={title}
            priority
            sizes="(max-width: 768px) 100vw, 768px"
          />
        </div>

        <div className="max-w-none">
          {paragraphs.length > 0 ? (
            paragraphs.map((paragraph, i) => (
              <p key={i} className="mb-4 leading-relaxed text-text-muted last:mb-0">
                {paragraph}
              </p>
            ))
          ) : (
            <p className="text-text-muted">Contenu de l&apos;article indisponible.</p>
          )}
        </div>
      </PageSection>
    </article>
  );
}
