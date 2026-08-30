import { ArrowRight } from "lucide-react";
import { NavCard } from "@/components/layout/NavCard";
import { Button } from "@/components/ui/Button";

export function homepageExploreDescription(href: string): string {
  if (href === "/services") return "Accompagnement, formation, audit et produits qualité";
  if (href === "/secteurs") return "Expertise sectorielle pour 5 domaines clés";
  if (href === "/a-propos") return "Notre mission, équipe et méthode de travail";
  if (href === "/actualites") return "Dernières nouvelles et mises à jour AQF";
  return "Rejoignez notre réseau d'experts qualité";
}

export function HomepageExplore({
  navLinks,
}: {
  navLinks: readonly { href: string; label: string }[];
}) {
  return (
    <section className="py-16 md:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2 className="mb-8 text-center text-2xl font-bold text-primary-900 md:mb-10">
          Explorez nos services
        </h2>
        <div className="grid gap-5 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
          {navLinks
            .filter((link) => link.href !== "/")
            .map((link) => (
              <NavCard
                key={link.href}
                href={link.href}
                title={link.label}
                description={homepageExploreDescription(link.href)}
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
  );
}
