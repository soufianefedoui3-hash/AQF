import { PageHero } from "@/components/ui/PageHero";

import { PageSection } from "@/components/ui/PageSection";

import { ArticleCard } from "@/components/news/ArticleCard";

import { getContentLabels, getPublishedArticles, labelOf } from "@/lib/content";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function ActualitesPage() {

  const [articles, labels] = await Promise.all([
    getPublishedArticles(),
    getContentLabels(),
  ]);



  return (

    <>

      <PageHero

        title={labelOf(labels, "news", "Actualités")}

        subtitle="Restez informé des dernières avancées en qualité, formation et réglementation."

      />



      <PageSection>

        {articles.length === 0 ? (

          <div className="rounded-2xl border border-dashed border-primary-200 bg-white p-12 text-center">

            <p className="text-text-muted">Aucun article publié pour le moment.</p>

          </div>

        ) : (

          <div className="grid gap-6 sm:grid-cols-2 sm:gap-8 lg:grid-cols-3">

            {articles.map((article) => (

              <ArticleCard key={article.id} {...article} />

            ))}

          </div>

        )}

      </PageSection>

    </>

  );

}

