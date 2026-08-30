import { AlertTriangle, CheckCircle2, Info, Quote } from "lucide-react";
import { PageSection, ContentCard } from "@/components/ui/PageSection";
import { Button } from "@/components/ui/Button";
import { FaqAccordion } from "@/components/content/FaqAccordion";
import { mediaEmbedUrl, type AlertTone, type PageBlock } from "@/lib/page-blocks";

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

const ALERT_STYLES: Record<
  AlertTone,
  { box: string; icon: string; Icon: typeof Info }
> = {
  info: {
    box: "border-sky-200 bg-sky-50 text-sky-950",
    icon: "text-sky-600",
    Icon: Info,
  },
  warning: {
    box: "border-amber-200 bg-amber-50 text-amber-950",
    icon: "text-amber-600",
    Icon: AlertTriangle,
  },
  success: {
    box: "border-emerald-200 bg-emerald-50 text-emerald-950",
    icon: "text-emerald-600",
    Icon: CheckCircle2,
  },
};

const DIVIDER_SPACE = {
  sm: "py-6 md:py-8",
  md: "py-12 md:py-16",
  lg: "py-16 md:py-24",
} as const;

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

        if (block.type === "cta") {
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
        }

        if (block.type === "alert") {
          const title = block.title.trim();
          const content = block.content.trim();
          if (!title && !content) return null;
          const style = ALERT_STYLES[block.tone] ?? ALERT_STYLES.info;
          const Icon = style.Icon;
          return (
            <PageSection key={block.id} container="3xl" muted={muted}>
              <div
                role="status"
                className={`flex gap-4 rounded-2xl border px-5 py-4 shadow-sm ${style.box}`}
              >
                <Icon className={`mt-0.5 h-6 w-6 shrink-0 ${style.icon}`} aria-hidden />
                <div>
                  {title ? <p className="font-semibold">{title}</p> : null}
                  {content ? (
                    <p className="mt-1 whitespace-pre-line text-sm leading-relaxed opacity-90">
                      {content}
                    </p>
                  ) : null}
                </div>
              </div>
            </PageSection>
          );
        }

        if (block.type === "quote") {
          const content = block.content.trim();
          const author = block.author.trim();
          if (!content) return null;
          return (
            <PageSection key={block.id} container="3xl" muted={muted}>
              <blockquote className="relative overflow-hidden rounded-3xl border border-primary-100 bg-white px-6 py-8 shadow-sm sm:px-10">
                <Quote
                  className="absolute right-6 top-6 h-12 w-12 text-accent-200"
                  aria-hidden
                />
                <p className="relative text-lg font-medium leading-relaxed text-primary-900 italic">
                  {`« ${content} »`}
                </p>
                {author ? (
                  <footer className="relative mt-4 text-sm font-semibold text-accent-700">
                    — {author}
                  </footer>
                ) : null}
              </blockquote>
            </PageSection>
          );
        }

        if (block.type === "grid") {
          const items = block.items.filter(
            (item) => item.title.trim() || item.content.trim()
          );
          const title = block.title.trim();
          if (!title && items.length === 0) return null;
          const cols =
            block.columns === 2
              ? "md:grid-cols-2"
              : "md:grid-cols-2 lg:grid-cols-3";
          return (
            <PageSection key={block.id} container="4xl" muted={muted}>
              {title ? (
                <h2 className="mb-8 text-2xl font-bold text-primary-900">{title}</h2>
              ) : null}
              <div className={`grid gap-5 ${cols}`}>
                {items.map((item, itemIndex) => (
                  <ContentCard key={`${block.id}-${itemIndex}`}>
                    {item.title.trim() ? (
                      <h3 className="mb-2 text-lg font-semibold text-primary-900">
                        {item.title.trim()}
                      </h3>
                    ) : null}
                    {item.content.trim() ? (
                      <p className="whitespace-pre-line text-sm leading-relaxed text-text-muted">
                        {item.content.trim()}
                      </p>
                    ) : null}
                  </ContentCard>
                ))}
              </div>
            </PageSection>
          );
        }

        if (block.type === "faq") {
          const items = block.items.filter(
            (item) => item.question.trim() || item.answer.trim()
          );
          const title = block.title.trim();
          if (!title && items.length === 0) return null;
          return (
            <PageSection key={block.id} container="3xl" muted={muted}>
              {title ? (
                <h2 className="mb-6 text-2xl font-bold text-primary-900">{title}</h2>
              ) : null}
              <FaqAccordion items={items} />
            </PageSection>
          );
        }

        if (block.type === "divider") {
          const label = block.label.trim();
          return (
            <section
              key={block.id}
              className={DIVIDER_SPACE[block.spacing] ?? DIVIDER_SPACE.md}
              aria-hidden={!label}
            >
              <div className="mx-auto flex max-w-3xl items-center gap-4 px-4 sm:px-6">
                <span className="h-px flex-1 bg-gradient-to-r from-transparent via-primary-200 to-primary-200" />
                {label ? (
                  <span className="text-xs font-semibold uppercase tracking-[0.2em] text-primary-400">
                    {label}
                  </span>
                ) : null}
                <span className="h-px flex-1 bg-gradient-to-l from-transparent via-primary-200 to-primary-200" />
              </div>
            </section>
          );
        }

        if (block.type === "video") {
          const embed = mediaEmbedUrl(block.url);
          const title = block.title.trim();
          if (!embed) return null;
          return (
            <PageSection key={block.id} container="4xl" muted={muted}>
              {title ? (
                <h2 className="mb-6 text-2xl font-bold text-primary-900">{title}</h2>
              ) : null}
              <div className="overflow-hidden rounded-2xl border border-primary-100 bg-black shadow-sm">
                <div className="relative aspect-video">
                  <iframe
                    src={embed}
                    title={title || "Vidéo"}
                    className="absolute inset-0 h-full w-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                    referrerPolicy="strict-origin-when-cross-origin"
                  />
                </div>
              </div>
            </PageSection>
          );
        }

        if (block.type === "stats") {
          const items = block.items.filter(
            (item) => item.value.trim() || item.label.trim()
          );
          const title = block.title.trim();
          if (!title && items.length === 0) return null;
          return (
            <PageSection key={block.id} container="4xl" muted={muted}>
              {title ? (
                <h2 className="mb-8 text-center text-2xl font-bold text-primary-900">
                  {title}
                </h2>
              ) : null}
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {items.map((item, itemIndex) => (
                  <div
                    key={`${block.id}-${itemIndex}`}
                    className="rounded-2xl border border-primary-100 bg-white px-6 py-8 text-center shadow-sm"
                  >
                    <p className="text-4xl font-bold tracking-tight text-accent-600">
                      {item.value.trim()}
                    </p>
                    {item.label.trim() ? (
                      <p className="mt-2 text-sm font-medium text-text-muted">
                        {item.label.trim()}
                      </p>
                    ) : null}
                  </div>
                ))}
              </div>
            </PageSection>
          );
        }

        return null;
      })}
    </div>
  );
}
