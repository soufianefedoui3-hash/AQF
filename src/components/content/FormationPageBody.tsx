import { CheckCircle2 } from "lucide-react";
import { PageSection } from "@/components/ui/PageSection";
import { FormationRegistrationForm } from "@/components/forms/FormationRegistrationForm";
import { FORMATION_BENEFITS } from "@/lib/constants";
import { SITE_COPY_DEFAULTS } from "@/lib/site-copy";
import type { ReactNode } from "react";

export type FormationSectionItem = {
  key: string;
  title: string | null;
  content: string;
};

export function FormationIntro({ content }: { content?: string }) {
  return (
    <div className="mx-auto max-w-3xl text-center">
      <p className="text-lg leading-relaxed text-text-muted">{content}</p>
    </div>
  );
}

export function FormationExtraCard({ section }: { section: FormationSectionItem }) {
  return (
    <div className="h-full rounded-2xl border border-primary-100 bg-white p-6 text-left shadow-sm">
      <h3 className="mb-3 text-lg font-semibold text-primary-900">
        {section.title?.trim() || "Section"}
      </h3>
      <p className="whitespace-pre-line text-sm leading-relaxed text-text-muted">
        {section.content}
      </p>
    </div>
  );
}

export function FormationCatalog({
  title,
  formations,
  benefitsTitle = SITE_COPY_DEFAULTS.formation_benefits_title,
  benefits = FORMATION_BENEFITS,
  emptyLabel = SITE_COPY_DEFAULTS.formation_empty,
}: {
  title: string;
  formations: string[];
  benefitsTitle?: string;
  benefits?: readonly string[];
  emptyLabel?: string;
}) {
  return (
    <div className="mt-12 grid gap-10 lg:mt-16 lg:grid-cols-2 lg:gap-12">
      <div>
        {benefitsTitle.trim() ? (
          <h2 className="mb-6 text-xl font-bold text-primary-900">{benefitsTitle}</h2>
        ) : null}
        <ul className="space-y-3">
          {benefits.map((benefit, i) => (
            <li key={`${benefit}-${i}`} className="flex items-start gap-3">
              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-secondary-500" />
              <span className="text-text-muted">
                <span className="font-medium text-primary-700">{i + 1}.</span> {benefit}
              </span>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h2 className="mb-6 text-xl font-bold text-primary-900">{title}</h2>
        {formations.length === 0 ? (
          <p className="text-sm text-text-muted">{emptyLabel}</p>
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
  );
}

export function FormationPageBody({
  intro,
  extraSections,
  catalogTitle,
  formations,
  benefitsTitle,
  benefits,
  enrollTitle = SITE_COPY_DEFAULTS.formation_enroll_title,
  emptyLabel,
  wrapIntro,
  wrapExtra,
  wrapCatalog,
  wrapEnroll,
}: {
  intro?: FormationSectionItem;
  extraSections: FormationSectionItem[];
  catalogTitle: string;
  formations: string[];
  benefitsTitle?: string;
  benefits?: readonly string[];
  enrollTitle?: string;
  emptyLabel?: string;
  wrapIntro?: (node: ReactNode) => ReactNode;
  wrapExtra?: (section: FormationSectionItem, node: ReactNode) => ReactNode;
  wrapCatalog?: (node: ReactNode) => ReactNode;
  wrapEnroll?: (node: ReactNode) => ReactNode;
}) {
  const introNode = <FormationIntro content={intro?.content} />;
  const catalog = (
    <FormationCatalog
      title={catalogTitle}
      formations={formations}
      benefitsTitle={benefitsTitle}
      benefits={benefits}
      emptyLabel={emptyLabel}
    />
  );
  const enroll = (
    <div className="mx-auto mt-12 max-w-2xl lg:mt-16">
      {enrollTitle.trim() ? (
        <h2 className="mb-6 text-center text-xl font-bold text-primary-900">{enrollTitle}</h2>
      ) : null}
      <FormationRegistrationForm formations={formations} />
    </div>
  );
  return (
    <PageSection>
      {wrapIntro ? wrapIntro(introNode) : introNode}
      {extraSections.length > 0 ? (
        <div className="mx-auto mt-10 grid max-w-5xl items-stretch gap-6 md:grid-cols-2">
          {extraSections.map((section) => {
            const card = <FormationExtraCard section={section} />;
            return (
              <div key={section.key} className="h-full min-h-0">
                {wrapExtra ? wrapExtra(section, card) : card}
              </div>
            );
          })}
        </div>
      ) : null}

      {wrapCatalog ? wrapCatalog(catalog) : catalog}
      {wrapEnroll ? wrapEnroll(enroll) : enroll}
    </PageSection>
  );
}
