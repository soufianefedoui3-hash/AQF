"use client";

import { useMemo, useState, type ReactNode } from "react";
import { Plus } from "lucide-react";
import { EditableRegion } from "@/components/admin/EditableRegion";
import { InsertRail } from "@/components/admin/builder/InsertRail";
import {
  AboutPageBody,
  AboutSectionCard,
  type AboutSectionItem,
  type AboutTeamMember,
} from "@/components/content/AboutPageBody";
import { Button } from "@/components/ui/Button";
import { ContentCard, PageSection } from "@/components/ui/PageSection";

export type ContentBlock = {
  key: string;
  title: string | null;
  content: string;
};

function wrapWithChrome(
  block: ContentBlock,
  saving: boolean,
  onSave: (data: ContentBlock) => Promise<void>,
  onDelete: () => Promise<void>,
  onAdd: () => Promise<void>,
  view: ReactNode,
  onLive?: (next: { title: string; content: string }) => void,
  onDuplicate?: () => Promise<void>
) {
  return (
    <EditableRegion
      label="Section"
      disabled={saving}
      fields={[
        { key: "title", label: "Titre" },
        { key: "content", label: "Texte", type: "textarea", rows: 6, placeholder: "Contenu de la section" },
      ]}
      values={{ title: block.title || "", content: block.content || "" }}
      onChange={(next) => onLive?.({ title: next.title, content: next.content })}
      onSave={(next) => onSave({ key: block.key, title: next.title, content: next.content })}
      onDelete={onDelete}
      onDuplicate={onDuplicate}
      onAdd={() => void onAdd()}
    >
      {view}
    </EditableRegion>
  );
}

export function SectionBlocksEditor({
  blocks,
  saving,
  onSave,
  onAdd,
  onDelete,
  onDuplicate,
  addLabel = "Ajouter une section",
  emptyLabel = "Aucune section. Ajoutez-en une pour commencer.",
  variant = "default",
  team,
  teamTitle,
  wrapMember,
  wrapTeamTitle,
}: {
  blocks: ContentBlock[];
  saving: boolean;
  onSave: (data: ContentBlock) => Promise<void>;
  onAdd: () => Promise<void>;
  onDelete: (key: string) => Promise<void>;
  onDuplicate?: (block: ContentBlock) => Promise<void>;
  addLabel?: string;
  emptyLabel?: string;
  variant?: "default" | "about" | "homepage";
  team?: AboutTeamMember[];
  teamTitle?: string;
  wrapMember?: (member: AboutTeamMember, node: ReactNode) => ReactNode;
  wrapTeamTitle?: (node: ReactNode) => ReactNode;
}) {
  const [live, setLive] = useState<Record<string, { title: string; content: string }>>({});
  const shown = useMemo(
    () =>
      blocks.map((block) => {
        const overlay = live[block.key];
        return overlay ? { ...block, title: overlay.title, content: overlay.content } : block;
      }),
    [blocks, live]
  );

  function chrome(block: ContentBlock, view: ReactNode) {
    return wrapWithChrome(
      block,
      saving,
      onSave,
      async () => {
        if (!confirm("Supprimer cette section ?")) return;
        await onDelete(block.key);
      },
      onAdd,
      view,
      (next) => setLive((prev) => ({ ...prev, [block.key]: next })),
      onDuplicate ? () => onDuplicate(block) : undefined
    );
  }

  if (variant === "about") {
    return (
      <div>
        <InsertRail disabled={saving} onAdd={() => void onAdd()} />
        <AboutPageBody
          sections={shown}
          team={team ?? []}
          teamTitle={teamTitle || "Équipe"}
          wrapSection={(section: AboutSectionItem, index, node) =>
            chrome(section, node ?? <AboutSectionCard section={section} index={index} />)
          }
          wrapMember={wrapMember}
          wrapTeamTitle={wrapTeamTitle}
        />
        <div className="pointer-events-none relative z-20 -mt-8 mb-8 flex justify-center">
          <Button
            type="button"
            variant="outline"
            loading={saving}
            className="pointer-events-auto shadow-sm"
            onClick={onAdd}
          >
            <Plus className="h-4 w-4" />
            {addLabel}
          </Button>
        </div>
      </div>
    );
  }

  if (variant === "homepage") {
    const [presentation, ...extraSections] = shown;
    return (
      <div>
        <InsertRail disabled={saving} onAdd={() => void onAdd()} />
        <HomepageEditable
          presentation={presentation}
          extraSections={extraSections}
          saving={saving}
          chrome={chrome}
          emptyLabel={emptyLabel}
        />
        <div className="pointer-events-none relative z-20 -mt-4 mb-8 flex justify-center">
          <Button
            type="button"
            variant="outline"
            loading={saving}
            className="pointer-events-auto shadow-sm"
            onClick={onAdd}
          >
            <Plus className="h-4 w-4" />
            {addLabel}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div>
      {shown.length === 0 ? (
        <PageSection>
          <p className="text-center text-text-muted">{emptyLabel}</p>
        </PageSection>
      ) : (
        <PageSection>
          <InsertRail disabled={saving} onAdd={() => void onAdd()} />
          <div className="grid gap-6 md:grid-cols-2">
            {shown.map((block) =>
              chrome(
                block,
                <ContentCard>
                  <h3 className="mb-3 text-lg font-semibold text-primary-900">
                    {block.title?.trim() || "Section"}
                  </h3>
                  <p className="whitespace-pre-line text-sm leading-relaxed text-text-muted">
                    {block.content}
                  </p>
                </ContentCard>
              )
            )}
          </div>
        </PageSection>
      )}
      <div className="pointer-events-none relative z-20 -mt-8 mb-8 flex justify-center">
        <Button type="button" variant="outline" loading={saving} className="pointer-events-auto shadow-sm" onClick={onAdd}>
          <Plus className="h-4 w-4" />
          {addLabel}
        </Button>
      </div>
    </div>
  );
}

function HomepageEditable({
  presentation,
  extraSections,
  saving,
  chrome,
  emptyLabel,
}: {
  presentation?: ContentBlock;
  extraSections: ContentBlock[];
  saving: boolean;
  chrome: (block: ContentBlock, view: ReactNode) => ReactNode;
  emptyLabel: string;
}) {
  if (!presentation && extraSections.length === 0) {
    return (
      <section className="py-16 md:py-20">
        <p className="text-center text-text-muted">{emptyLabel}</p>
      </section>
    );
  }

  return (
    <section className="py-16 md:py-20">
      {presentation ? (
        chrome(
          presentation,
          <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
            <span className="mb-4 inline-block rounded-full bg-secondary-100 px-4 py-1.5 text-sm font-medium text-secondary-800 ring-1 ring-secondary-200">
              {presentation.title?.trim() || "Présentation"}
            </span>
            <p className="text-lg leading-relaxed text-text-muted">{presentation.content}</p>
          </div>
        )
      ) : null}
      {extraSections.length > 0 ? (
        <div className="mx-auto mt-12 grid max-w-5xl gap-6 px-4 sm:px-6 md:grid-cols-2">
          {extraSections.map((section) =>
            chrome(
              section,
              <div className="rounded-2xl border border-primary-100 bg-white p-6 text-left shadow-sm">
                <h3 className="mb-3 text-lg font-semibold text-primary-900">
                  {section.title?.trim() || "Section"}
                </h3>
                <p className="whitespace-pre-line text-sm leading-relaxed text-text-muted">
                  {section.content}
                </p>
              </div>
            )
          )}
        </div>
      ) : null}
    </section>
  );
}

export function sortAboutBlocks(sections: ContentBlock[]): ContentBlock[] {
  const rank = (key: string) =>
    key === "presentation" ? 0 : key === "steps" ? 1 : 2;
  return [...sections].sort(
    (a, b) => rank(a.key) - rank(b.key) || a.key.localeCompare(b.key)
  );
}

export function pageBlocks(
  pages: ContentBlock[],
  primaryKey: string,
  extraPrefix: string
): ContentBlock[] {
  const primary = pages.find((page) => page.key === primaryKey);
  const extras = pages
    .filter((page) => page.key.startsWith(extraPrefix))
    .sort((a, b) => a.key.localeCompare(b.key));
  return primary ? [primary, ...extras] : extras;
}
