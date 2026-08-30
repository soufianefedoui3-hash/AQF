import { PageHero } from "@/components/ui/PageHero";
import { PageBlockList } from "@/components/content/PageBlockList";
import { SectorsPageBody } from "@/components/content/SectorsPageBody";
import { getContentLabels, getSectors, getTabLayoutBlocks, labelOf } from "@/lib/content";

export default async function SecteursPage() {
  const [sectors, labels, extraBlocks] = await Promise.all([
    getSectors(),
    getContentLabels(),
    getTabLayoutBlocks("sectors"),
  ]);

  return (
    <>
      <PageHero
        title={labelOf(labels, "sectors", "Secteurs")}
        subtitle="Une expertise sectorielle reconnue pour les domaines les plus exigeants."
      />
      <SectorsPageBody sectors={sectors} />
      <PageBlockList blocks={extraBlocks} showEmpty={false} />
    </>
  );
}
