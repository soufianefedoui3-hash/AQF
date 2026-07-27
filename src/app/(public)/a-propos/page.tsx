import { Users, FileText, ListChecks } from "lucide-react";
import { PageHero } from "@/components/ui/PageHero";
import { PageSection, ContentCard } from "@/components/ui/PageSection";
import { getAboutData } from "@/lib/content";

export default async function AboutPage() {
  const { presentation, steps, team } = await getAboutData();

  return (
    <>
      <PageHero
        title="À propos de AQF"
        subtitle="Notre mission, notre équipe et notre méthode d'accompagnement."
      />

      <PageSection>
        <div className="mb-12 grid gap-6 lg:mb-16 lg:grid-cols-2 lg:gap-8">
          <ContentCard>
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary-100">
                <FileText className="h-5 w-5 text-primary-700" />
              </div>
              <h2 className="text-lg font-semibold text-primary-900">{presentation.title}</h2>
            </div>
            <p className="whitespace-pre-line text-sm leading-relaxed text-text-muted">
              {presentation.content}
            </p>
          </ContentCard>

          <ContentCard>
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-secondary-100">
                <ListChecks className="h-5 w-5 text-secondary-700" />
              </div>
              <h2 className="text-lg font-semibold text-primary-900">{steps.title}</h2>
            </div>
            <p className="whitespace-pre-line text-sm leading-relaxed text-text-muted">
              {steps.content}
            </p>
          </ContentCard>
        </div>

        <div>
          <div className="mb-8 flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent-100">
              <Users className="h-5 w-5 text-accent-700" />
            </div>
            <h2 className="text-2xl font-bold text-primary-900">Portfolios — Notre Équipe</h2>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {team.map((member) => (
              <ContentCard key={member.id} hover>
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-primary-600 to-secondary-500 text-xl font-bold text-white">
                  {member.name.charAt(0)}
                </div>
                <h3 className="text-lg font-semibold text-primary-900">{member.name}</h3>
                <p className="text-sm font-medium text-accent-600">{member.role}</p>
                <p className="mt-2 text-sm text-text-muted">{member.skills}</p>
              </ContentCard>
            ))}
          </div>
        </div>
      </PageSection>
    </>
  );
}
