import { getHomepageSections, getNavLinks, getTabLayoutBlocks } from "@/lib/content";
import { PageBlockList } from "@/components/content/PageBlockList";
import { HomepageHero } from "@/components/content/HomepageHero";
import { HomepageStats } from "@/components/content/HomepageStats";
import { HomepageExplore } from "@/components/content/HomepageExplore";
import { HomepagePresentation } from "@/components/content/HomepagePresentation";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function HomePage() {
  const [sections, navLinks, extraBlocks] = await Promise.all([
    getHomepageSections(),
    getNavLinks(),
    getTabLayoutBlocks("homepage"),
  ]);
  const [presentation, ...extraSections] = sections;

  return (
    <>
      <HomepageHero />
      <HomepagePresentation presentation={presentation} extraSections={extraSections} />
      <HomepageStats />
      <HomepageExplore navLinks={navLinks} />
      <PageBlockList blocks={extraBlocks} showEmpty={false} />
    </>
  );
}
