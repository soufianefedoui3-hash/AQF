import { Mail, Phone } from "lucide-react";
import { PageHero } from "@/components/ui/PageHero";
import { PageSection, ContentCard } from "@/components/ui/PageSection";
import { CareersApplicationForm } from "@/components/forms/CareersApplicationForm";
import { getCareersSettings } from "@/lib/content";

export const dynamic = "force-dynamic";

export default async function CarrieresPage() {
  let settings;
  try {
    settings = await getCareersSettings();
  } catch {
    settings = {
      title: "Votre expertise, notre force",
      content:
        "AQF recherche des experts qualité, formateurs, auditeurs et consultants. Joignez votre CV et lettre de motivation.",
      email: "recrutement@aqf.ma",
      phone: "+212 600 000 000",
    };
  }

  const phone = String(settings.phone || "").trim();
  const email = String(settings.email || "").trim();
  const phoneDigits = phone.replace(/\s/g, "");

  return (
    <>
      <PageHero
        title={String(settings.title || "").trim() || "Votre expertise, notre force"}
        subtitle="Rejoignez AQF et contribuez à l'excellence qualité."
      />

      <PageSection>
        <div className="grid gap-6 lg:grid-cols-2 lg:gap-8">
          <ContentCard>
            <p className="mb-6 whitespace-pre-line text-sm leading-relaxed text-text-muted">
              {settings.content || ""}
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
      </PageSection>
    </>
  );
}
