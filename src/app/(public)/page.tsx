import {
  getContentLabels,
  getHomepageExploreCards,
  getHomepageSections,
  getHomepageStatCards,
  getNavLinks,
  getTabLayoutBlocks,
} from "@/lib/content";
import { PageBlockList } from "@/components/content/PageBlockList";
import { HomepageHero } from "@/components/content/HomepageHero";
import { HomepageStats } from "@/components/content/HomepageStats";
import { HomepageExplore } from "@/components/content/HomepageExplore";
import { HomepagePresentation } from "@/components/content/HomepagePresentation";
import { resolveCopy } from "@/lib/site-copy";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function HomePage() {
  const [sections, navLinks, extraBlocks, labels] = await Promise.all([
    getHomepageSections(),
    getNavLinks(),
    getTabLayoutBlocks("homepage"),
    getContentLabels(),
  ]);
  const [presentation, ...extraSections] = sections;
  const [statCards, exploreCards] = await Promise.all([
    getHomepageStatCards(labels),
    getHomepageExploreCards(navLinks, labels),
  ]);

  return (
    <>
      <HomepageHero tagline={resolveCopy(labels, "hero_tagline")} />
      <HomepagePresentation presentation={presentation} extraSections={extraSections} />
      <HomepageStats stats={statCards} />
      <HomepageExplore
        navLinks={exploreCards}
        title={resolveCopy(labels, "explore_title")}
        ctaLabel={resolveCopy(labels, "explore_cta")}
      />
      <PageBlockList blocks={extraBlocks} showEmpty={false} />
    </>
  );
}
