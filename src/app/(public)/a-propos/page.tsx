import { PageHero } from "@/components/ui/PageHero";
import { PageBlockList } from "@/components/content/PageBlockList";
import { AboutPageBody } from "@/components/content/AboutPageBody";
import { getAboutData, getContentLabels, getTabLayoutBlocks, labelOf } from "@/lib/content";
import { resolveCopy } from "@/lib/site-copy";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function AboutPage() {
  const [{ sections, team }, labels, aboutBlocks, teamBlocks] = await Promise.all([
    getAboutData(),
    getContentLabels(),
    getTabLayoutBlocks("about"),
    getTabLayoutBlocks("team"),
  ]);

  return (
    <>
      <PageHero
        title={labelOf(labels, "about", "À propos")}
        subtitle={resolveCopy(labels, "subtitle_about")}
      />

      <AboutPageBody
        sections={sections}
        team={team}
        teamTitle={labelOf(labels, "team", "Équipe")}
      />
      <PageBlockList blocks={aboutBlocks} showEmpty={false} />
      <PageBlockList blocks={teamBlocks} showEmpty={false} />
    </>
  );
}
