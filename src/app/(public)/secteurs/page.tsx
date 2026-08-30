import { PageHero } from "@/components/ui/PageHero";
import { PageBlockList } from "@/components/content/PageBlockList";
import { SectorsPageBody } from "@/components/content/SectorsPageBody";
import { getContentLabels, getSectors, getTabLayoutBlocks, labelOf } from "@/lib/content";
import { resolveCopy } from "@/lib/site-copy";

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
        subtitle={resolveCopy(labels, "subtitle_sectors")}
      />
      <SectorsPageBody
        sectors={sectors}
        discoverLabel={resolveCopy(labels, "sectors_discover")}
        emptyDescription={resolveCopy(labels, "sectors_empty_desc")}
      />
      <PageBlockList blocks={extraBlocks} showEmpty={false} />
    </>
  );
}
