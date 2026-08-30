import { Mail, Phone } from "lucide-react";
import { PageSection, ContentCard } from "@/components/ui/PageSection";
import { CareersApplicationForm } from "@/components/forms/CareersApplicationForm";

export function CareersPageBody({
  content,
  email,
  phone,
  extraSections,
}: {
  content: string;
  email: string;
  phone: string;
  extraSections: readonly { key: string; title: string | null; content: string }[];
}) {
  const phoneDigits = phone.replace(/\s/g, "");

  return (
    <PageSection>
      <div className="grid gap-6 lg:grid-cols-2 lg:gap-8">
        <ContentCard>
          <p className="mb-6 whitespace-pre-line text-sm leading-relaxed text-text-muted">
            {content || ""}
          </p>
          <div className="space-y-4">
            {email ? (
              <div className="flex items-center gap-3 rounded-xl bg-primary-50 p-4">
                <Mail className="h-5 w-5 shrink-0 text-primary-600" />
                <div className="min-w-0">
                  <p className="text-xs text-text-muted">Email de candidature</p>
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
                  <p className="text-xs text-text-muted">Numéro de téléphone</p>
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

        <CareersApplicationForm />
      </div>
      {extraSections.length > 0 ? (
        <div className="mt-8 grid gap-6 md:grid-cols-2">
          {extraSections.map((section) => (
            <ContentCard key={section.key}>
              <h3 className="mb-3 text-lg font-semibold text-primary-900">
                {section.title?.trim() || "Section"}
              </h3>
              <p className="whitespace-pre-line text-sm leading-relaxed text-text-muted">
                {section.content}
              </p>
            </ContentCard>
          ))}
        </div>
      ) : null}
    </PageSection>
  );
}
