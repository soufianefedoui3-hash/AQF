import { PageHero } from "@/components/ui/PageHero";
import { ProductsPageBody } from "@/components/content/ProductsPageBody";
import { PageBlockList } from "@/components/content/PageBlockList";
import {
  getContentLabels,
  getGedExtraSections,
  getGedService,
  getProductPacks,
  getTabLayoutBlocks,
  labelOf,
} from "@/lib/content";
import { resolveCopy } from "@/lib/site-copy";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function ProduitsPage() {
  const [ged, packs, extraSections, labels, packBlocks, gedBlocks] = await Promise.all([
    getGedService(),
    getProductPacks(),
    getGedExtraSections(),
    getContentLabels(),
    getTabLayoutBlocks("packs"),
    getTabLayoutBlocks("ged"),
  ]);

  return (
    <>
      <PageHero
        title={labelOf(labels, "products", "Produits et Services")}
        subtitle={resolveCopy(labels, "subtitle_packs")}
        backHref="/services"
        backLabel={resolveCopy(labels, "back_to_services")}
      />
      <ProductsPageBody
        packsTitle={labelOf(labels, "packs", "Packs produits")}
        gedTitle={labelOf(labels, "ged", "GED")}
        packs={packs}
        ged={ged}
        extraSections={extraSections}
        packsBadge={resolveCopy(labels, "products_packs_badge")}
        packsSubtitle={resolveCopy(labels, "products_packs_subtitle")}
        gedBadge={resolveCopy(labels, "products_ged_badge")}
        gedSubtitle={resolveCopy(labels, "products_ged_subtitle")}
        gedFallback={resolveCopy(labels, "products_ged_fallback")}
        emptyLabel={resolveCopy(labels, "products_empty")}
      />
      <PageBlockList blocks={packBlocks} showEmpty={false} />
      <PageBlockList blocks={gedBlocks} showEmpty={false} />
    </>
  );
}
