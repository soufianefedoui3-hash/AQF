import { PageHero } from "@/components/ui/PageHero";

import { PageSection } from "@/components/ui/PageSection";

import { ArticleCard } from "@/components/news/ArticleCard";

import { PageBlockList } from "@/components/content/PageBlockList";
import { getContentLabels, getPublishedArticles, getTabLayoutBlocks, labelOf } from "@/lib/content";
import { resolveCopy } from "@/lib/site-copy";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function ActualitesPage() {

  const [articles, labels, extraBlocks] = await Promise.all([
    getPublishedArticles(),
    getContentLabels(),
    getTabLayoutBlocks("news"),
  ]);



  return (

    <>

      <PageHero

        title={labelOf(labels, "news", "Actualités")}

        subtitle={resolveCopy(labels, "subtitle_news")}

      />



      <PageSection>

        {articles.length === 0 ? (

          <div className="rounded-2xl border border-dashed border-primary-200 bg-white p-12 text-center">

            <p className="text-text-muted">{resolveCopy(labels, "news_empty")}</p>

          </div>

        ) : (

          <div className="grid gap-6 sm:grid-cols-2 sm:gap-8 lg:grid-cols-3">

            {articles.map((article) => (

              <ArticleCard key={article.id} {...article} />

            ))}

          </div>

        )}

      </PageSection>
      <PageBlockList blocks={extraBlocks} showEmpty={false} />

    </>

  );

}

