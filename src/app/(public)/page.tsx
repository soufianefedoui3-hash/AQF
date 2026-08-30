import { ArrowRight } from "lucide-react";
import { NAV_LINKS, HOMEPAGE_STATS } from "@/lib/constants";
import { getHomepageSections } from "@/lib/content";
import { NavCard } from "@/components/layout/NavCard";
import { Button } from "@/components/ui/Button";
import { Logo } from "@/components/brand/Logo";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function HomePage() {
  const sections = await getHomepageSections();
  const [presentation, ...extraSections] = sections;

  return (
    <>
      <section className="relative overflow-hidden bg-brand-gradient pb-20 pt-12 md:pb-24 md:pt-14">
        <div
          className="pointer-events-none absolute inset-0 opacity-15"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%2322c8e8' fill-opacity='0.25'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />

        <div className="relative z-10 mx-auto flex max-w-7xl flex-col items-center px-4 text-center sm:px-6 lg:px-8">
          <Logo variant="hero" href={null} priority className="mx-auto" />
          <p className="mx-auto mt-8 max-w-xl text-base text-accent-100 sm:text-lg">
            Votre partenaire d&apos;excellence en Qualité, Formation et Audit
          </p>
        </div>
      </section>

      <section className="py-16 md:py-20">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
          <span className="mb-4 inline-block rounded-full bg-secondary-100 px-4 py-1.5 text-sm font-medium text-secondary-800 ring-1 ring-secondary-200">
            {presentation.title?.trim() || "Présentation"}
          </span>
          <p className="text-lg leading-relaxed text-text-muted">{presentation.content}</p>
        </div>
        {extraSections.length > 0 ? (
          <div className="mx-auto mt-12 grid max-w-5xl gap-6 px-4 sm:px-6 md:grid-cols-2">
            {extraSections.map((section) => (
              <div
                key={section.key}
                className="rounded-2xl border border-primary-100 bg-white p-6 text-left shadow-sm"
              >
                <h3 className="mb-3 text-lg font-semibold text-primary-900">
                  {section.title?.trim() || "Section"}
                </h3>
                <p className="whitespace-pre-line text-sm leading-relaxed text-text-muted">
                  {section.content}
                </p>
              </div>
            ))}
          </div>
        ) : null}
      </section>

      <section className="bg-surface-muted py-14 md:py-16">
        <div className="mx-auto grid max-w-5xl grid-cols-2 gap-4 px-4 sm:grid-cols-4 sm:gap-6 sm:px-6">
          {HOMEPAGE_STATS.map((stat) => (
            <div
              key={stat.label}
              className="rounded-2xl border border-primary-100 bg-white p-5 text-center shadow-sm sm:p-6"
            >
              <p className="text-2xl font-bold text-primary-900 sm:text-3xl">{stat.value}</p>
              <p className="mt-1 text-xs text-text-muted sm:text-sm">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="py-16 md:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="mb-8 text-center text-2xl font-bold text-primary-900 md:mb-10">
            Explorez nos services
          </h2>
          <div className="grid gap-5 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
            {NAV_LINKS.filter((l) => l.href !== "/").map((link) => (
              <NavCard
                key={link.href}
                href={link.href}
                title={link.label}
                description={
                  link.href === "/services"
                    ? "Accompagnement, formation, audit et produits qualité"
                    : link.href === "/secteurs"
                      ? "Expertise sectorielle pour 5 domaines clés"
                      : link.href === "/a-propos"
                        ? "Notre mission, équipe et méthode de travail"
                        : link.href === "/actualites"
                          ? "Dernières nouvelles et mises à jour AQF"
                          : "Rejoignez notre réseau d'experts qualité"
                }
              />
            ))}
          </div>

          <div className="mt-10 text-center md:mt-12">
            <Button href="/services" variant="secondary" size="lg">
              Découvrir nos services
              <ArrowRight className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
