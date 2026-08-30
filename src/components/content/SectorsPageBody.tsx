import type { ReactNode } from "react";
import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { Microscope, Wheat, GraduationCap, HeartPulse, Pill, ArrowRight } from "lucide-react";
import { PageSection } from "@/components/ui/PageSection";
import { SectorImage } from "@/components/sectors/SectorImage";
import { SITE_COPY_DEFAULTS } from "@/lib/site-copy";

const ICON_MAP: Record<string, LucideIcon> = {
  "laboratoire-biologie-medicale": Microscope,
  "entreprise-agroalimentaire": Wheat,
  universite: GraduationCap,
  clinique: HeartPulse,
  pharma: Pill,
};

export function SectorsPageBody({
  sectors,
  discoverLabel = SITE_COPY_DEFAULTS.sectors_discover,
  emptyDescription = SITE_COPY_DEFAULTS.sectors_empty_desc,
  wrapSector,
}: {
  sectors: readonly {
    slug: string;
    name: string;
    description: string;
    imageUrl: string | null;
  }[];
  discoverLabel?: string;
  emptyDescription?: string;
  wrapSector?: (
    sector: { slug: string; name: string; description: string; imageUrl: string | null },
    node: ReactNode
  ) => ReactNode;
}) {
  return (
    <PageSection>
      <div className="grid gap-6 sm:grid-cols-2 sm:gap-8 lg:grid-cols-3">
        {sectors.map((sector) => {
          const Icon = ICON_MAP[sector.slug] ?? Microscope;
          const name = sector.name?.trim() || "Secteur";
          const description = sector.description?.trim() || emptyDescription;

          const card = (
            <Link
              href={`/secteurs/${sector.slug}`}
              className="group flex flex-col overflow-hidden rounded-2xl border border-primary-100 bg-white shadow-sm transition hover:-translate-y-1 hover:border-accent-200 hover:shadow-xl"
            >
              <div className="relative h-48 overflow-hidden bg-primary-100 sm:h-52">
                <SectorImage src={sector.imageUrl} alt={name} />
                <div className="absolute inset-0 bg-gradient-to-t from-primary-900/85 via-primary-900/30 to-transparent" />
                <div className="absolute bottom-4 left-4 flex items-center gap-3 pr-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white/20 backdrop-blur-sm">
                    <Icon className="h-5 w-5 text-white" />
                  </div>
                  <h2 className="text-base font-semibold text-white sm:text-lg">{name}</h2>
                </div>
              </div>
              <div className="flex flex-1 flex-col p-5 sm:p-6">
                <p className="line-clamp-3 flex-1 text-sm text-text-muted">{description}</p>
                {discoverLabel.trim() ? (
                  <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-accent-600">
                    {discoverLabel}
                    <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                  </span>
                ) : null}
              </div>
            </Link>
          );
          return (
            <div key={sector.slug}>{wrapSector ? wrapSector(sector, card) : card}</div>
          );
        })}
      </div>
    </PageSection>
  );
}
