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
        subtitle="Packs d'implémentation prêts à l'emploi et solutions web sur mesure."
        backHref="/services"
        backLabel="Retour aux services"
      />
      <ProductsPageBody
        packsTitle={labelOf(labels, "packs", "Packs produits")}
        gedTitle={labelOf(labels, "ged", "GED")}
        packs={packs}
        ged={ged}
        extraSections={extraSections}
      />
      <PageBlockList blocks={packBlocks} showEmpty={false} />
      <PageBlockList blocks={gedBlocks} showEmpty={false} />
    </>
  );
}
