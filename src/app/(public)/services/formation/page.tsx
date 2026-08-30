import { PageHero } from "@/components/ui/PageHero";
import { FormationPageBody } from "@/components/content/FormationPageBody";
import { PageBlockList } from "@/components/content/PageBlockList";
import { getContentLabels, getFormationSections, getTabLayoutBlocks, labelOf } from "@/lib/content";
import { getFormationTypes } from "@/lib/formations";

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
        subtitle="Des formations adaptées aux étudiants et aux professionnels de santé et du corporate."
        backHref="/services"
        backLabel="Retour aux services"
      />

      <FormationPageBody
        intro={intro}
        extraSections={extraSections}
        catalogTitle={labelOf(labels, "formations", "Formations disponibles")}
        formations={formations}
      />
      <PageBlockList blocks={formationBlocks} showEmpty={false} />
      <PageBlockList blocks={catalogBlocks} showEmpty={false} />
    </>
  );
}
