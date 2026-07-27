import { PageHero } from "@/components/ui/PageHero";

import { PageSection } from "@/components/ui/PageSection";

import { ArticleCard } from "@/components/news/ArticleCard";

import { getPublishedArticles } from "@/lib/content";



export default async function ActualitesPage() {

  const articles = await getPublishedArticles();



  return (

    <>

      <PageHero

        title="Actualités"

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

