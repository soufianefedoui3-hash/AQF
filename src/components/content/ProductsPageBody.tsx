import type { ReactNode } from "react";
import { PageSection } from "@/components/ui/PageSection";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { PackMockup } from "@/components/ui/PackMockup";
import { GedRequestForm } from "@/components/forms/GedRequestForm";
import { Logo } from "@/components/brand/Logo";
import { SITE_COPY_DEFAULTS } from "@/lib/site-copy";

export type ProductPackItem = {
  id: string;
  name: string;
  description: string;
};

export type GedItem = {
  title: string;
  description: string;
  imageUrl: string | null;
};

export function ProductsPageBody({
  packsTitle,
  gedTitle,
  packs,
  ged,
  extraSections,
  packsBadge = SITE_COPY_DEFAULTS.products_packs_badge,
  packsSubtitle = SITE_COPY_DEFAULTS.products_packs_subtitle,
  gedBadge = SITE_COPY_DEFAULTS.products_ged_badge,
  gedSubtitle = SITE_COPY_DEFAULTS.products_ged_subtitle,
  gedFallback = SITE_COPY_DEFAULTS.products_ged_fallback,
  emptyLabel = SITE_COPY_DEFAULTS.products_empty,
  wrapPacksHeader,
  wrapPack,
  wrapGedHeader,
  wrapGed,
  wrapExtra,
}: {
  packsTitle: string;
  gedTitle: string;
  packs: readonly ProductPackItem[];
  ged: GedItem;
  extraSections: readonly { key: string; title: string | null; content: string }[];
  packsBadge?: string;
  packsSubtitle?: string;
  gedBadge?: string;
  gedSubtitle?: string;
  gedFallback?: string;
  emptyLabel?: string;
  wrapPacksHeader?: (node: ReactNode) => ReactNode;
  wrapPack?: (pack: ProductPackItem, node: ReactNode) => ReactNode;
  wrapGedHeader?: (node: ReactNode) => ReactNode;
  wrapGed?: (node: ReactNode) => ReactNode;
  wrapExtra?: (
    section: { key: string; title: string | null; content: string },
    node: ReactNode
  ) => ReactNode;
}) {
  const packsHeader = (
    <SectionHeader badge={packsBadge} title={packsTitle} subtitle={packsSubtitle} />
  );
  const gedHeader = (
    <SectionHeader badge={gedBadge} title={gedTitle} subtitle={gedSubtitle} />
  );
  return (
    <>
      <PageSection>
        {wrapPacksHeader ? wrapPacksHeader(packsHeader) : packsHeader}
        {packs.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-primary-200 bg-white p-12 text-center">
            <p className="text-text-muted">{emptyLabel}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 xl:gap-10">
            {packs.map((pack) => {
              const card = <PackMockup name={pack.name} description={pack.description} />;
              return (
                <div key={pack.id}>{wrapPack ? wrapPack(pack, card) : card}</div>
              );
            })}
          </div>
        )}
      </PageSection>

      <PageSection muted>
        {wrapGedHeader ? wrapGedHeader(gedHeader) : gedHeader}

        <div className="grid gap-10 lg:grid-cols-2 lg:gap-12">
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary-700 to-primary-900 shadow-xl">
            {ged.imageUrl ? (
              <>
                <div className="relative aspect-video">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={ged.imageUrl}
                    alt={ged.title}
                    className="absolute inset-0 h-full w-full object-cover opacity-90"
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
                  <p className="mt-2 text-sm text-secondary-300">{gedFallback}</p>
                </div>
              </div>
            )}
          </div>

          {(() => {
            const details = (
              <div className="flex flex-col">
                <h3 className="text-xl font-bold text-primary-900">{ged.title}</h3>
                <p className="mt-4 flex-1 whitespace-pre-line text-sm leading-relaxed text-text-muted">
                  {ged.description}
                </p>
                <div className="mt-8">
                  <GedRequestForm />
                </div>
              </div>
            );
            return wrapGed ? wrapGed(details) : details;
          })()}
        </div>
        {extraSections.length > 0 ? (
          <div className="mt-10 grid gap-6 md:grid-cols-2">
            {extraSections.map((section) => {
              const card = (
                <div className="rounded-2xl border border-primary-100 bg-white p-6 shadow-sm">
                  <h3 className="mb-3 text-lg font-semibold text-primary-900">
                    {section.title?.trim() || "Section"}
                  </h3>
                  <p className="whitespace-pre-line text-sm leading-relaxed text-text-muted">
                    {section.content}
                  </p>
                </div>
              );
              return (
                <div key={section.key}>{wrapExtra ? wrapExtra(section, card) : card}</div>
              );
            })}
          </div>
        ) : null}
      </PageSection>
    </>
  );
}
