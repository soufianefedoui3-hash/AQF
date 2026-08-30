import { PageHero } from "@/components/ui/PageHero";
import { PageBlockList } from "@/components/content/PageBlockList";
import { ServicesPageBody } from "@/components/content/ServicesPageBody";
import { getContentLabels, getServiceLinks, getTabLayoutBlocks, labelOf } from "@/lib/content";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function ServicesPage() {
  const [services, labels, extraBlocks] = await Promise.all([
    getServiceLinks(),
    getContentLabels(),
    getTabLayoutBlocks("services"),
  ]);

  return (
    <>
      <PageHero
        title={labelOf(labels, "services", "Nos Services")}
        subtitle="Des solutions complètes pour votre excellence en qualité, formation et audit."
      />
      <ServicesPageBody services={services} />
      <PageBlockList blocks={extraBlocks} showEmpty={false} />
    </>
  );
}
