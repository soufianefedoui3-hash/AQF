import type { ReactNode } from "react";
import { AlertTriangle, CheckCircle2, Info, Quote } from "lucide-react";
import { PageSection, ContentCard } from "@/components/ui/PageSection";
import { Button } from "@/components/ui/Button";
import { FaqAccordion } from "@/components/content/FaqAccordion";
import { cn } from "@/lib/utils";
import { mediaEmbedUrl, type AlertTone, type PageBlock } from "@/lib/page-blocks";
import { toLocalImageUrl } from "@/lib/placeholder-images";

export function isSafeHref(href: string): boolean {
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

export const ALERT_STYLES: Record<
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

export const DIVIDER_SPACE = {
  sm: "py-6 md:py-8",
  md: "py-12 md:py-16",
  lg: "py-16 md:py-24",
} as const;

function Placeholder({ children }: { children: string }) {
  return <span className="italic text-primary-300">{children}</span>;
}

function CardPhoto({ src, alt }: { src?: string; alt: string }) {
  const imageUrl = toLocalImageUrl(src) || src?.trim();
  if (!imageUrl) return null;
  return (
    <div className="mb-4 overflow-hidden rounded-xl bg-primary-50">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={imageUrl} alt={alt} className="h-40 w-full object-cover" />
    </div>
  );
}

export function PageBlockView({
  block,
  muted = false,
  showPlaceholders = false,
  compact = false,
  wrapGridItem,
  wrapStatItem,
  wrapFaqItem,
  wrapListItem,
}: {
  block: PageBlock;
  muted?: boolean;
  showPlaceholders?: boolean;
  compact?: boolean;
  wrapGridItem?: (
    item: { title: string; content: string },
    index: number,
    node: ReactNode
  ) => ReactNode;
  wrapStatItem?: (
    item: { value: string; label: string },
    index: number,
    node: ReactNode
  ) => ReactNode;
  wrapFaqItem?: (
    item: { question: string; answer: string },
    index: number,
    node: ReactNode
  ) => ReactNode;
  wrapListItem?: (item: string, index: number, node: ReactNode) => ReactNode;
}) {
  const sectionClass = compact ? "py-8 md:py-10" : undefined;

  if (block.type === "paragraph") {
    const content = block.content.trim();
    if (!content && !showPlaceholders) return null;
    return (
      <PageSection container="3xl" muted={muted} className={sectionClass}>
        <p className="whitespace-pre-line text-base leading-relaxed text-text-muted">
          {content || <Placeholder>Paragraphe…</Placeholder>}
        </p>
      </PageSection>
    );
  }

  if (block.type === "heading") {
    const title = block.title.trim();
    const content = block.content.trim();
    if (!title && !content && !showPlaceholders) return null;
    return (
      <PageSection container="3xl" muted={muted} className={sectionClass}>
        <h2 className="mb-4 text-2xl font-bold text-primary-900">
          {title || <Placeholder>Titre…</Placeholder>}
        </h2>
        {content || showPlaceholders ? (
          <p className="whitespace-pre-line text-base leading-relaxed text-text-muted">
            {content || <Placeholder>Texte d’accompagnement…</Placeholder>}
          </p>
        ) : null}
      </PageSection>
    );
  }

  if (block.type === "card") {
    const title = block.title.trim();
    const content = block.content.trim();
    if (!title && !content && !showPlaceholders) return null;
    return (
      <PageSection container="3xl" muted={muted} className={sectionClass}>
        <ContentCard>
          <CardPhoto src={block.imageUrl} alt={title || "Carte"} />
          <h2 className="mb-3 text-xl font-semibold text-primary-900">
            {title || <Placeholder>Titre de la carte…</Placeholder>}
          </h2>
          <p className="whitespace-pre-line text-sm leading-relaxed text-text-muted">
            {content || <Placeholder>Contenu de la carte…</Placeholder>}
          </p>
        </ContentCard>
      </PageSection>
    );
  }

  if (block.type === "list") {
    const items = block.items.map((item) => item.trim()).filter(Boolean);
    const title = block.title.trim();
    if (!title && items.length === 0 && !showPlaceholders) return null;
    const display = items.length > 0 ? items : showPlaceholders ? ["Point clé…"] : [];
    return (
      <PageSection container="3xl" muted={muted} className={sectionClass}>
        {title || showPlaceholders ? (
          <h2 className="mb-4 text-2xl font-bold text-primary-900">
            {title || <Placeholder>Titre de la liste…</Placeholder>}
          </h2>
        ) : null}
        <div className="space-y-3">
          {(showPlaceholders ? block.items : display).map((item, itemIndex) => {
            const row = (
              <div className="flex gap-3 text-text-muted">
                <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-accent-500" aria-hidden />
                <span
                  className={cn(
                    "leading-relaxed",
                    !item.trim() && "italic text-primary-300"
                  )}
                >
                  {item.trim() || "Point clé…"}
                </span>
              </div>
            );
            return (
              <div key={`${block.id}-${itemIndex}`}>
                {wrapListItem ? wrapListItem(item, itemIndex, row) : row}
              </div>
            );
          })}
        </div>
      </PageSection>
    );
  }

  if (block.type === "cta") {
    const label = block.label.trim();
    const href = block.href.trim();
    if ((!label || !isSafeHref(href)) && !showPlaceholders) return null;
    return (
      <PageSection container="3xl" muted={muted} className={sectionClass}>
        <div className="text-center">
          <Button href={isSafeHref(href) ? href : "#"} variant="secondary" size="lg">
            {label || "Bouton d’action"}
          </Button>
        </div>
      </PageSection>
    );
  }

  if (block.type === "alert") {
    const title = block.title.trim();
    const content = block.content.trim();
    if (!title && !content && !showPlaceholders) return null;
    const style = ALERT_STYLES[block.tone] ?? ALERT_STYLES.info;
    const Icon = style.Icon;
    return (
      <PageSection container="3xl" muted={muted} className={sectionClass}>
        <div role="status" className={`flex gap-4 rounded-2xl border px-5 py-4 shadow-sm ${style.box}`}>
          <Icon className={`mt-0.5 h-6 w-6 shrink-0 ${style.icon}`} aria-hidden />
          <div>
            <p className="font-semibold">{title || <Placeholder>Titre d’alerte…</Placeholder>}</p>
            <p className="mt-1 whitespace-pre-line text-sm leading-relaxed opacity-90">
              {content || <Placeholder>Message…</Placeholder>}
            </p>
          </div>
        </div>
      </PageSection>
    );
  }

  if (block.type === "quote") {
    const content = block.content.trim();
    const author = block.author.trim();
    if (!content && !showPlaceholders) return null;
    return (
      <PageSection container="3xl" muted={muted} className={sectionClass}>
        <blockquote className="relative overflow-hidden rounded-3xl border border-primary-100 bg-white px-6 py-8 shadow-sm sm:px-10">
          <Quote className="absolute right-6 top-6 h-12 w-12 text-accent-200" aria-hidden />
          <p className="relative text-lg font-medium leading-relaxed text-primary-900 italic">
            {content ? `« ${content} »` : <Placeholder>« Citation… »</Placeholder>}
          </p>
          <footer className="relative mt-4 text-sm font-semibold text-accent-700">
            {author ? `— ${author}` : <Placeholder>— Auteur</Placeholder>}
          </footer>
        </blockquote>
      </PageSection>
    );
  }

  if (block.type === "grid") {
    const items = block.items.filter(
      (item) => item.title.trim() || item.content.trim() || Boolean(item.imageUrl?.trim())
    );
    const title = block.title.trim();
    if (!title && items.length === 0 && !showPlaceholders) return null;
    const display =
      items.length > 0
        ? items
        : showPlaceholders
          ? [
              { title: "Carte 1", content: "Description…" },
              { title: "Carte 2", content: "Description…" },
            ]
          : [];
    const cols = block.columns === 2 ? "md:grid-cols-2" : "md:grid-cols-2 lg:grid-cols-3";
    return (
      <PageSection container="4xl" muted={muted} className={sectionClass}>
        {title || showPlaceholders ? (
          <h2 className="mb-8 text-2xl font-bold text-primary-900">
            {title || <Placeholder>Titre de la grille…</Placeholder>}
          </h2>
        ) : null}
        <div className={`grid items-stretch gap-6 ${cols}`}>
          {(showPlaceholders ? block.items : display).map((item, itemIndex) => {
            const card = (
              <ContentCard className="h-full">
                <CardPhoto src={item.imageUrl} alt={item.title.trim() || "Carte"} />
                <h3 className="mb-2 text-lg font-semibold text-primary-900">
                  {item.title.trim() || <Placeholder>Titre…</Placeholder>}
                </h3>
                <p className="whitespace-pre-line text-sm leading-relaxed text-text-muted">
                  {item.content.trim() || <Placeholder>Texte…</Placeholder>}
                </p>
              </ContentCard>
            );
            return (
              <div key={`${block.id}-${itemIndex}`} className="h-full min-h-0">
                {wrapGridItem ? wrapGridItem(item, itemIndex, card) : card}
              </div>
            );
          })}
        </div>
      </PageSection>
    );
  }

  if (block.type === "faq") {
    const items = block.items.filter((item) => item.question.trim() || item.answer.trim());
    const title = block.title.trim();
    if (!title && items.length === 0 && !showPlaceholders) return null;
    const display =
      items.length > 0
        ? items
        : showPlaceholders
          ? [{ question: "Votre question ?", answer: "La réponse." }]
          : [];
    return (
      <PageSection container="3xl" muted={muted} className={sectionClass}>
        {title || showPlaceholders ? (
          <h2 className="mb-6 text-2xl font-bold text-primary-900">
            {title || <Placeholder>Questions fréquentes</Placeholder>}
          </h2>
        ) : null}
        <FaqAccordion
          items={showPlaceholders ? block.items : display}
          wrapItem={wrapFaqItem}
        />
      </PageSection>
    );
  }

  if (block.type === "divider") {
    const label = block.label.trim();
    return (
      <section
        className={cn(DIVIDER_SPACE[block.spacing] ?? DIVIDER_SPACE.md, compact && "py-8")}
        aria-hidden={!label}
      >
        <div className="mx-auto flex max-w-3xl items-center gap-4 px-4 sm:px-6">
          <span className="h-px flex-1 bg-gradient-to-r from-transparent via-primary-200 to-primary-200" />
          {label ? (
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-primary-400">
              {label}
            </span>
          ) : showPlaceholders ? (
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-primary-200">
              Séparateur
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
    if (!embed && !showPlaceholders) return null;
    return (
      <PageSection container="4xl" muted={muted} className={sectionClass}>
        {title || showPlaceholders ? (
          <h2 className="mb-6 text-2xl font-bold text-primary-900">
            {title || <Placeholder>Titre de la vidéo…</Placeholder>}
          </h2>
        ) : null}
        {embed ? (
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
        ) : (
          <div className="flex aspect-video items-center justify-center rounded-2xl border border-dashed border-primary-200 bg-primary-50 text-sm text-text-muted">
            Collez un lien YouTube ou Vimeo
          </div>
        )}
      </PageSection>
    );
  }

  if (block.type === "stats") {
    const items = block.items.filter((item) => item.value.trim() || item.label.trim());
    const title = block.title.trim();
    if (!title && items.length === 0 && !showPlaceholders) return null;
    const display =
      items.length > 0
        ? items
        : showPlaceholders
          ? [{ value: "0", label: "Indicateur" }]
          : [];
    return (
      <PageSection container="4xl" muted={muted} className={sectionClass}>
        {title || showPlaceholders ? (
          <h2 className="mb-8 text-center text-2xl font-bold text-primary-900">
            {title || <Placeholder>Chiffres clés</Placeholder>}
          </h2>
        ) : null}
        <div className="grid items-stretch gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {(showPlaceholders ? block.items : display).map((item, itemIndex) => {
            const card = (
              <div className="h-full rounded-2xl border border-primary-100 bg-white px-6 py-8 text-center shadow-sm">
                <p className="text-4xl font-bold tracking-tight text-accent-600">
                  {item.value.trim() || "0"}
                </p>
                <p className="mt-2 text-sm font-medium text-text-muted">
                  {item.label.trim() || <Placeholder>Libellé</Placeholder>}
                </p>
              </div>
            );
            return (
              <div key={`${block.id}-${itemIndex}`} className="h-full min-h-0">
                {wrapStatItem ? wrapStatItem(item, itemIndex, card) : card}
              </div>
            );
          })}
        </div>
      </PageSection>
    );
  }

  return null;
}
