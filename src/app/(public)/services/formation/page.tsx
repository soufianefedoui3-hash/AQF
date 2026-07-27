import { CheckCircle2 } from "lucide-react";
import { PageHero } from "@/components/ui/PageHero";
import { PageSection } from "@/components/ui/PageSection";
import { FormationRegistrationForm } from "@/components/forms/FormationRegistrationForm";
import { FORMATION_BENEFITS } from "@/lib/constants";
import { getFormationIntro } from "@/lib/content";
import { getFormationTypes } from "@/lib/formations";

export default async function FormationPage() {
  const [intro, formations] = await Promise.all([
    getFormationIntro(),
    getFormationTypes(),
  ]);

  return (
    <>
      <PageHero
        title="Formation Qualité"
        subtitle="Des formations adaptées aux étudiants et aux professionnels de santé et du corporate."
        backHref="/services"
        backLabel="Retour aux services"
      />

      <PageSection>
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-lg leading-relaxed text-text-muted">{intro.content}</p>
        </div>

        <div className="mt-12 grid gap-10 lg:mt-16 lg:grid-cols-2 lg:gap-12">
          <div>
            <h2 className="mb-6 text-xl font-bold text-primary-900">
              Ce que comprend chaque formation
            </h2>
            <ul className="space-y-3">
              {FORMATION_BENEFITS.map((benefit, i) => (
                <li key={benefit} className="flex items-start gap-3">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-secondary-500" />
                  <span className="text-text-muted">
                    <span className="font-medium text-primary-700">{i + 1}.</span> {benefit}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="mb-6 text-xl font-bold text-primary-900">Formations disponibles</h2>
            {formations.length === 0 ? (
              <p className="text-sm text-text-muted">Aucune formation disponible pour le moment.</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {formations.map((type) => (
                  <span
                    key={type}
                    className="rounded-lg border border-accent-200 bg-accent-50 px-4 py-2 text-sm font-medium text-primary-900"
                  >
                    {type}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="mx-auto mt-12 max-w-2xl lg:mt-16">
          <h2 className="mb-6 text-center text-xl font-bold text-primary-900">
            Inscription à une formation
          </h2>
          <FormationRegistrationForm formations={formations} />
        </div>
      </PageSection>
    </>
  );
}
