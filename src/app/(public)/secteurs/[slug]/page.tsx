import { notFound } from "next/navigation";
import { PageHero } from "@/components/ui/PageHero";
import { PageSection } from "@/components/ui/PageSection";
import { SectorImage } from "@/components/sectors/SectorImage";
import { getSectorBySlug } from "@/lib/content";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function SectorDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const sector = await getSectorBySlug(slug);

  if (!sector) notFound();

  const name = sector.name?.trim() || "Secteur";

  return (
    <>
      <PageHero
        title={name}
        backHref="/secteurs"
        backLabel="Retour aux secteurs"
        image={sector.imageUrl || undefined}
      />

      <PageSection container="4xl">
        <div className="relative mb-10 h-56 overflow-hidden rounded-2xl sm:h-72">
          <SectorImage
            src={sector.imageUrl}
            alt={name}
            sizes="(max-width: 896px) 100vw, 896px"
          />
          <div
            className="pointer-events-none absolute inset-0 bg-gradient-to-t from-primary-900/40 to-transparent"
            aria-hidden
          />
        </div>

        <div className="max-w-none">
          {(sector.description || "")
            .split("\n")
            .filter((paragraph) => paragraph.trim())
            .map((paragraph, i) => (
              <p key={i} className="mb-4 leading-relaxed text-text-muted last:mb-0">
                {paragraph}
              </p>
            ))}
          {!sector.description?.trim() && (
            <p className="text-text-muted">Description indisponible pour ce secteur.</p>
          )}
        </div>
      </PageSection>
    </>
  );
}
