import Image from "next/image";
import { PageHero } from "@/components/ui/PageHero";
import { PageSection } from "@/components/ui/PageSection";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { PackMockup } from "@/components/ui/PackMockup";
import { GedRequestForm } from "@/components/forms/GedRequestForm";
import { Logo } from "@/components/brand/Logo";
import { getGedService, getProductPacks } from "@/lib/content";

export default async function ProduitsPage() {
  const [ged, packs] = await Promise.all([getGedService(), getProductPacks()]);

  return (
    <>
      <PageHero
        title="Produits et Services"
        subtitle="Packs d'implémentation prêts à l'emploi et solutions web sur mesure."
        backHref="/services"
        backLabel="Retour aux services"
      />

      <PageSection>
        <SectionHeader
          badge="Partie 1"
          title="Packs d'implémentation"
          subtitle="Des packs complets, prêts à déployer, pour chaque norme clé."
        />
        {packs.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-primary-200 bg-white p-12 text-center">
            <p className="text-text-muted">Aucun pack disponible pour le moment.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 xl:gap-10">
            {packs.map((pack) => (
              <PackMockup key={pack.id} name={pack.name} description={pack.description} />
            ))}
          </div>
        )}
      </PageSection>

      <PageSection muted>
        <SectionHeader
          badge="Partie 2"
          title="Services Web"
          subtitle="Solution GED développée par AQF pour la gestion documentaire qualité."
        />

        <div className="grid gap-10 lg:grid-cols-2 lg:gap-12">
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary-700 to-primary-900 shadow-xl">
            {ged.imageUrl ? (
              <>
                <div className="relative aspect-video">
                  <Image
                    src={ged.imageUrl}
                    alt={ged.title}
                    fill
                    className="object-cover opacity-90"
                    sizes="(max-width: 1024px) 100vw, 50vw"
                  />
                </div>
                <div
                  className="pointer-events-none absolute inset-0 bg-gradient-to-t from-primary-900/60 to-transparent"
                  aria-hidden
                />
              </>
            ) : (
              <div className="flex aspect-video items-center justify-center p-8 sm:p-12">
                <div className="text-center">
                  <div className="mx-auto mb-4 flex justify-center">
                    <Logo variant="mockup" href={null} tone="light" />
                  </div>
                  <p className="text-2xl font-bold text-white">GED</p>
                  <p className="mt-2 text-sm text-secondary-300">
                    Gestion Électronique des Documents
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="flex flex-col">
            <h3 className="text-xl font-bold text-primary-900">{ged.title}</h3>
            <p className="mt-4 flex-1 whitespace-pre-line text-sm leading-relaxed text-text-muted">
              {ged.description}
            </p>
            <div className="mt-8">
              <GedRequestForm />
            </div>
          </div>
        </div>
      </PageSection>
    </>
  );
}
