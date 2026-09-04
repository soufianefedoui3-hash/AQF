import type { ReactNode } from "react";
import { ArrowRight } from "lucide-react";
import { NavCard } from "@/components/layout/NavCard";
import { Button } from "@/components/ui/Button";
import { SITE_COPY_DEFAULTS, exploreDescKey } from "@/lib/site-copy";

export function homepageExploreDescription(href: string): string {
  return SITE_COPY_DEFAULTS[exploreDescKey(href)] || "Rejoignez notre réseau d'experts qualité";
}

export function HomepageExplore({
  navLinks,
  title = SITE_COPY_DEFAULTS.explore_title,
  ctaLabel = SITE_COPY_DEFAULTS.explore_cta,
  descriptions,
  wrapHeader,
  wrapCard,
  wrapCta,
}: {
  navLinks: readonly { href: string; label: string }[];
  title?: string;
  ctaLabel?: string;
  descriptions?: Record<string, string>;
  wrapHeader?: (node: ReactNode) => ReactNode;
  wrapCard?: (link: { href: string; label: string }, node: ReactNode) => ReactNode;
  wrapCta?: (node: ReactNode) => ReactNode;
}) {
  const heading = title.trim() ? (
    <h2 className="mb-8 text-center text-2xl font-bold text-primary-900 md:mb-10">{title}</h2>
  ) : null;
  const cta = ctaLabel.trim() ? (
    <div className="mt-10 text-center md:mt-12">
      <Button href="/services" variant="secondary" size="lg">
        {ctaLabel}
        <ArrowRight className="h-5 w-5" />
      </Button>
    </div>
  ) : null;

  return (
    <section className="py-16 md:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {wrapHeader && heading ? wrapHeader(heading) : heading}
        <div className="grid items-stretch gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {navLinks
            .filter((link) => link.href !== "/")
            .map((link) => {
              const card = (
                <NavCard
                  href={link.href}
                  title={link.label}
                  description={
                    descriptions?.[link.href] ?? homepageExploreDescription(link.href)
                  }
                />
              );
              return (
                <div key={link.href} className="h-full min-h-0">
                  {wrapCard ? wrapCard(link, card) : card}
                </div>
              );
            })}
        </div>
        {wrapCta && cta ? wrapCta(cta) : cta}
      </div>
    </section>
  );
}
