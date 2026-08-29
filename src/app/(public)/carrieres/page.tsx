import { Mail, Phone } from "lucide-react";

import { PageHero } from "@/components/ui/PageHero";

import { PageSection, ContentCard } from "@/components/ui/PageSection";

import { CareersApplicationForm } from "@/components/forms/CareersApplicationForm";

import { getCareersSettings } from "@/lib/content";



export default async function CarrieresPage() {

  const settings = await getCareersSettings();

  const phoneDigits = settings.phone.replace(/\s/g, "");



  return (

    <>

      <PageHero
        title={settings.title?.trim() || "Votre expertise, notre force"}
        subtitle="Rejoignez AQF et contribuez à l'excellence qualité."
      />



      <PageSection>

        <div className="grid gap-6 lg:grid-cols-2 lg:gap-8">

          <ContentCard>

            <p className="mb-6 whitespace-pre-line text-sm leading-relaxed text-text-muted">

              {settings.content}

            </p>

            <div className="space-y-4">

              <div className="flex items-center gap-3 rounded-xl bg-primary-50 p-4">

                <Mail className="h-5 w-5 shrink-0 text-primary-600" />

                <div className="min-w-0">

                  <p className="text-xs text-text-muted">Email de candidature</p>

                  <a

                    href={`mailto:${settings.email}`}

                    className="break-all font-medium text-primary-700 hover:underline"

                  >

                    {settings.email}

                  </a>

                </div>

              </div>

              <div className="flex items-center gap-3 rounded-xl bg-secondary-50 p-4">

                <Phone className="h-5 w-5 shrink-0 text-secondary-600" />

                <div>

                  <p className="text-xs text-text-muted">Numéro de téléphone</p>

                  <a

                    href={`tel:${phoneDigits}`}

                    className="font-medium text-secondary-700 hover:underline"

                  >

                    {settings.phone}

                  </a>

                </div>

              </div>

            </div>

          </ContentCard>



          <CareersApplicationForm />

        </div>

      </PageSection>

    </>

  );

}

