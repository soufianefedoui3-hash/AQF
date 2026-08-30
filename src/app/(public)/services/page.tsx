import { PageHero } from "@/components/ui/PageHero";
import { PageBlockList } from "@/components/content/PageBlockList";
import { ServicesPageBody } from "@/components/content/ServicesPageBody";
import { getContentLabels, getServiceLinks, getTabLayoutBlocks, labelOf } from "@/lib/content";
import { resolveCopy } from "@/lib/site-copy";

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
        subtitle={resolveCopy(labels, "subtitle_services")}
      />
      <ServicesPageBody services={services} ctaLabel={resolveCopy(labels, "service_cta")} />
      <PageBlockList blocks={extraBlocks} showEmpty={false} />
    </>
  );
}
