import { PageHero } from "@/components/ui/PageHero";
import { CareersPageBody } from "@/components/content/CareersPageBody";
import { PageBlockList } from "@/components/content/PageBlockList";
import {
  getCareersExtraSections,
  getCareersSettings,
  getContentLabels,
  getTabLayoutBlocks,
  labelOf,
} from "@/lib/content";

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
  const [extraSections, labels, extraBlocks] = await Promise.all([
    getCareersExtraSections(),
    getContentLabels(),
    getTabLayoutBlocks("careers"),
  ]);

  return (
    <>
      <PageHero
        title={
          String(settings.title || "").trim() ||
          labelOf(labels, "careers", "Votre expertise, notre force")
        }
        subtitle="Rejoignez AQF et contribuez à l'excellence qualité."
      />
      <CareersPageBody
        content={String(settings.content || "")}
        email={String(settings.email || "").trim()}
        phone={String(settings.phone || "").trim()}
        extraSections={extraSections}
      />
      <PageBlockList blocks={extraBlocks} showEmpty={false} />
    </>
  );
}
