import { PageSection, ContentCard } from "@/components/ui/PageSection";
import { Button } from "@/components/ui/Button";
import type { PageBlock } from "@/lib/page-blocks";

function isSafeHref(href: string): boolean {
  const value = href.trim();
  if (!value) return false;
  if (value.startsWith("/") && !value.startsWith("//")) return true;
  if (value.startsWith("#")) return true;
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

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
      {blocks.map((block, index) => {
        const muted = index % 2 === 1;
        if (block.type === "paragraph") {
          const content = block.content.trim();
          if (!content) return null;
          return (
            <PageSection key={block.id} container="3xl" muted={muted}>
              <p className="whitespace-pre-line text-base leading-relaxed text-text-muted">
                {content}
              </p>
            </PageSection>
          );
        }

        if (block.type === "heading") {
          const title = block.title.trim();
          const content = block.content.trim();
          if (!title && !content) return null;
          return (
            <PageSection key={block.id} container="3xl" muted={muted}>
              {title ? (
                <h2 className="mb-4 text-2xl font-bold text-primary-900">{title}</h2>
              ) : null}
              {content ? (
                <p className="whitespace-pre-line text-base leading-relaxed text-text-muted">
                  {content}
                </p>
              ) : null}
            </PageSection>
          );
        }

        if (block.type === "card") {
          const title = block.title.trim();
          const content = block.content.trim();
          if (!title && !content) return null;
          return (
            <PageSection key={block.id} container="3xl" muted={muted}>
              <ContentCard>
                {title ? (
                  <h2 className="mb-3 text-xl font-semibold text-primary-900">{title}</h2>
                ) : null}
                {content ? (
                  <p className="whitespace-pre-line text-sm leading-relaxed text-text-muted">
                    {content}
                  </p>
                ) : null}
              </ContentCard>
            </PageSection>
          );
        }

        if (block.type === "list") {
          const items = block.items.map((item) => item.trim()).filter(Boolean);
          const title = block.title.trim();
          if (!title && items.length === 0) return null;
          return (
            <PageSection key={block.id} container="3xl" muted={muted}>
              {title ? (
                <h2 className="mb-4 text-2xl font-bold text-primary-900">{title}</h2>
              ) : null}
              <ul className="space-y-3">
                {items.map((item, itemIndex) => (
                  <li key={`${block.id}-${itemIndex}`} className="flex gap-3 text-text-muted">
                    <span
                      className="mt-2 h-2 w-2 shrink-0 rounded-full bg-accent-500"
                      aria-hidden
                    />
                    <span className="leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>
            </PageSection>
          );
        }

        const label = block.label.trim();
        const href = block.href.trim();
        if (!label || !isSafeHref(href)) return null;
        return (
          <PageSection key={block.id} container="3xl" muted={muted}>
            <div className="text-center">
              <Button href={href} variant="secondary" size="lg">
                {label}
              </Button>
            </div>
          </PageSection>
        );
      })}
    </div>
  );
}
