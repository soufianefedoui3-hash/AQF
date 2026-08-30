import { Users, FileText, ListChecks } from "lucide-react";
import { PageHero } from "@/components/ui/PageHero";
import { PageSection, ContentCard } from "@/components/ui/PageSection";
import { getAboutData, getContentLabels, labelOf } from "@/lib/content";
import { normalizeImageUrl } from "@/lib/news";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function AboutPage() {
  const [{ sections, team }, labels] = await Promise.all([
    getAboutData(),
    getContentLabels(),
  ]);

  return (
    <>
      <PageHero
        title={labelOf(labels, "about", "À propos")}
        subtitle="Notre mission, notre équipe et notre méthode d'accompagnement."
      />

      <PageSection>
        <div className="mb-12 grid gap-6 lg:mb-16 lg:grid-cols-2 lg:gap-8">
          {sections.map((section, index) => (
            <ContentCard key={section.key}>
              <div className="mb-4 flex items-center gap-3">
                <div
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${
                    index % 2 === 0 ? "bg-primary-100" : "bg-secondary-100"
                  }`}
                >
                  {index % 2 === 0 ? (
                    <FileText className="h-5 w-5 text-primary-700" />
                  ) : (
                    <ListChecks className="h-5 w-5 text-secondary-700" />
                  )}
                </div>
                <h2 className="text-lg font-semibold text-primary-900">{section.title}</h2>
              </div>
              <p className="whitespace-pre-line text-sm leading-relaxed text-text-muted">
                {section.content}
              </p>
            </ContentCard>
          ))}
        </div>

        <div>
          <div className="mb-8 flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent-100">
              <Users className="h-5 w-5 text-accent-700" />
            </div>
            <h2 className="text-2xl font-bold text-primary-900">
              {labelOf(labels, "team", "Équipe")}
            </h2>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {team.map((member) => {
              const photo = normalizeImageUrl(member.imageUrl);
              return (
                <ContentCard key={member.id} hover>
                  {photo ? (
                    <div className="relative mb-4 h-16 w-16 overflow-hidden rounded-full bg-primary-100">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={photo}
                        alt={member.name}
                        className="h-full w-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-primary-600 to-secondary-500 text-xl font-bold text-white">
                      {member.name.charAt(0)}
                    </div>
                  )}
                  <h3 className="text-lg font-semibold text-primary-900">{member.name}</h3>
                  <p className="text-sm font-medium text-accent-600">{member.role}</p>
                  <p className="mt-2 text-sm text-text-muted">{member.skills}</p>
                </ContentCard>
              );
            })}
          </div>
        </div>
      </PageSection>
    </>
  );
}
