import { Users, FileText, ListChecks } from "lucide-react";
import { PageSection, ContentCard } from "@/components/ui/PageSection";
import { normalizeImageUrl } from "@/lib/news";
import type { ReactNode } from "react";

export type AboutSectionItem = {
  key: string;
  title: string | null;
  content: string;
};

export type AboutTeamMember = {
  id: string;
  name: string;
  role: string;
  skills: string;
  imageUrl: string | null;
};

export function AboutSectionCard({
  section,
  index,
}: {
  section: AboutSectionItem;
  index: number;
}) {
  return (
    <ContentCard className="h-full">
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
  );
}

export function AboutTeamCard({ member }: { member: AboutTeamMember }) {
  const photo = normalizeImageUrl(member.imageUrl);
  return (
    <ContentCard hover className="h-full">
      {photo ? (
        <div className="relative mb-4 h-16 w-16 overflow-hidden rounded-full bg-primary-100">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={photo} alt={member.name} className="h-full w-full object-cover" />
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
}

export function AboutPageBody({
  sections,
  team,
  teamTitle,
  wrapSection,
  wrapMember,
  wrapTeamTitle,
}: {
  sections: AboutSectionItem[];
  team: AboutTeamMember[];
  teamTitle: string;
  wrapSection?: (section: AboutSectionItem, index: number, node: ReactNode) => ReactNode;
  wrapMember?: (member: AboutTeamMember, node: ReactNode) => ReactNode;
  wrapTeamTitle?: (node: ReactNode) => ReactNode;
}) {
  return (
    <PageSection>
      <div className="mb-12 grid items-stretch gap-6 lg:mb-16 lg:grid-cols-2 lg:gap-8">
        {sections.map((section, index) => {
          const card = <AboutSectionCard section={section} index={index} />;
          return (
            <div key={section.key} className="h-full min-h-0">
              {wrapSection ? wrapSection(section, index, card) : card}
            </div>
          );
        })}
      </div>

      <div>
        {(() => {
          const heading = (
            <div className="mb-8 flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent-100">
                <Users className="h-5 w-5 text-accent-700" />
              </div>
              <h2 className="text-2xl font-bold text-primary-900">{teamTitle}</h2>
            </div>
          );
          return wrapTeamTitle ? wrapTeamTitle(heading) : heading;
        })()}

        <div className="grid items-stretch gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {team.map((member) => {
            const card = <AboutTeamCard member={member} />;
            return (
              <div key={member.id} className="h-full min-h-0">
                {wrapMember ? wrapMember(member, card) : card}
              </div>
            );
          })}
        </div>
      </div>
    </PageSection>
  );
}
