import type { ReactNode } from "react";
import { Mail, Phone } from "lucide-react";
import { PageSection, ContentCard } from "@/components/ui/PageSection";
import { CareersApplicationForm } from "@/components/forms/CareersApplicationForm";
import { SITE_COPY_DEFAULTS } from "@/lib/site-copy";

export function CareersPageBody({
  content,
  email,
  phone,
  extraSections,
  emailLabel = SITE_COPY_DEFAULTS.careers_email_label,
  phoneLabel = SITE_COPY_DEFAULTS.careers_phone_label,
  wrapIntro,
  wrapExtra,
}: {
  content: string;
  email: string;
  phone: string;
  extraSections: readonly { key: string; title: string | null; content: string }[];
  emailLabel?: string;
  phoneLabel?: string;
  wrapIntro?: (node: ReactNode) => ReactNode;
  wrapExtra?: (
    section: { key: string; title: string | null; content: string },
    node: ReactNode
  ) => ReactNode;
}) {
  const phoneDigits = phone.replace(/\s/g, "");
  const intro = (
    <ContentCard>
      <p className="mb-6 whitespace-pre-line text-sm leading-relaxed text-text-muted">
        {content || ""}
      </p>
      <div className="space-y-4">
        {email ? (
          <div className="flex items-center gap-3 rounded-xl bg-primary-50 p-4">
            <Mail className="h-5 w-5 shrink-0 text-primary-600" />
            <div className="min-w-0">
              <p className="text-xs text-text-muted">{emailLabel}</p>
              <a
                href={`mailto:${email}`}
                className="break-all font-medium text-primary-700 hover:underline"
              >
                {email}
              </a>
            </div>
          </div>
        ) : null}
        {phone ? (
          <div className="flex items-center gap-3 rounded-xl bg-secondary-50 p-4">
            <Phone className="h-5 w-5 shrink-0 text-secondary-600" />
            <div>
              <p className="text-xs text-text-muted">{phoneLabel}</p>
              <a
                href={`tel:${phoneDigits}`}
                className="font-medium text-secondary-700 hover:underline"
              >
                {phone}
              </a>
            </div>
          </div>
        ) : null}
      </div>
    </ContentCard>
  );

  return (
    <PageSection>
      <div className="grid gap-6 lg:grid-cols-2 lg:gap-8">
        {wrapIntro ? wrapIntro(intro) : intro}
        <CareersApplicationForm />
      </div>
      {extraSections.length > 0 ? (
        <div className="mt-8 grid items-stretch gap-6 md:grid-cols-2">
          {extraSections.map((section) => {
            const card = (
              <ContentCard className="h-full">
                <h3 className="mb-3 text-lg font-semibold text-primary-900">
                  {section.title?.trim() || "Section"}
                </h3>
                <p className="whitespace-pre-line text-sm leading-relaxed text-text-muted">
                  {section.content}
                </p>
              </ContentCard>
            );
            return (
              <div key={section.key} className="h-full min-h-0">
                {wrapExtra ? wrapExtra(section, card) : card}
              </div>
            );
          })}
        </div>
      ) : null}
    </PageSection>
  );
}
