import Link from "next/link";
import { Building2, GraduationCap, ClipboardCheck, Package, ArrowRight } from "lucide-react";
import { PageHero } from "@/components/ui/PageHero";
import { PageSection } from "@/components/ui/PageSection";
import { SERVICE_LINKS } from "@/lib/constants";

const ICONS = {
  Accompagnement: Building2,
  "Formation Qualité": GraduationCap,
  Audit: ClipboardCheck,
  "Produits & Services": Package,
};

export default function ServicesPage() {
  return (
    <>
      <PageHero
        title="Nos Services"
        subtitle="Des solutions complètes pour votre excellence en qualité, formation et audit."
      />

      <PageSection>
        <div className="grid gap-6 md:grid-cols-2 md:gap-8">
          {SERVICE_LINKS.map((service) => {
            const Icon = ICONS[service.title as keyof typeof ICONS] || Package;
            return (
              <Link
                key={service.href}
                href={service.href}
                className="group relative overflow-hidden rounded-2xl border border-primary-100 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-accent-200 hover:shadow-xl hover:shadow-accent-400/10 sm:p-8"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-accent-400/5 to-secondary-400/5 opacity-0 transition group-hover:opacity-100" />
                <div className="relative flex flex-col gap-4 sm:flex-row sm:items-start sm:gap-5">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-accent-50 text-primary-800 ring-1 ring-accent-200 transition group-hover:bg-accent-gradient group-hover:text-white group-hover:ring-0">
                    <Icon className="h-7 w-7" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h2 className="text-xl font-semibold text-primary-900 group-hover:text-accent-700">
                      {service.title}
                    </h2>
                    <p className="mt-2 text-sm leading-relaxed text-text-muted">
                      {service.description}
                    </p>
                    <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-accent-600">
                      Accéder
                      <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </PageSection>
    </>
  );
}
