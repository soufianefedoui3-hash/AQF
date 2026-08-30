import { PageSection } from "@/components/ui/PageSection";
import { PageBlockView } from "@/components/content/PageBlockView";
import type { PageBlock } from "@/lib/page-blocks";

export function PageBlockList({
  blocks,
  showEmpty = true,
}: {
  blocks: PageBlock[];
  showEmpty?: boolean;
}) {
  if (blocks.length === 0) {
    if (!showEmpty) return null;
    return (
      <PageSection container="3xl">
        <p className="text-center text-text-muted">Contenu à venir.</p>
      </PageSection>
    );
  }

  return (
    <div>
      {blocks.map((block, index) => (
        <PageBlockView key={block.id} block={block} muted={index % 2 === 1} />
      ))}
    </div>
  );
}
