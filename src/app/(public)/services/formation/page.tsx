import { PageHero } from "@/components/ui/PageHero";
import { FormationPageBody } from "@/components/content/FormationPageBody";
import { PageBlockList } from "@/components/content/PageBlockList";
import { getContentLabels, getFormationSections, getTabLayoutBlocks, labelOf } from "@/lib/content";
import { getFormationTypes } from "@/lib/formations";
import { formationBenefitsFromLabels, resolveCopy } from "@/lib/site-copy";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function FormationPage() {
  const [sections, formations, labels, formationBlocks, catalogBlocks] = await Promise.all([
    getFormationSections(),
    getFormationTypes(),
    getContentLabels(),
    getTabLayoutBlocks("formation"),
    getTabLayoutBlocks("formations"),
  ]);
  const [intro, ...extraSections] = sections;

  return (
    <>
      <PageHero
        title={intro.title?.trim() || labelOf(labels, "formation", "Formation Qualité")}
        subtitle={resolveCopy(labels, "subtitle_formation")}
        backHref="/services"
        backLabel={resolveCopy(labels, "back_to_services")}
      />

      <FormationPageBody
        intro={intro}
        extraSections={extraSections}
        catalogTitle={labelOf(labels, "formations", "Formations disponibles")}
        formations={formations}
        benefitsTitle={resolveCopy(labels, "formation_benefits_title")}
        benefits={formationBenefitsFromLabels(labels)}
        enrollTitle={resolveCopy(labels, "formation_enroll_title")}
        emptyLabel={resolveCopy(labels, "formation_empty")}
      />
      <PageBlockList blocks={formationBlocks} showEmpty={false} />
      <PageBlockList blocks={catalogBlocks} showEmpty={false} />
    </>
  );
}
