"use client";

import { useEffect, useState, type ReactNode } from "react";
import { Plus } from "lucide-react";
import { VisualItemChrome } from "@/components/admin/VisualItemChrome";
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

function EditableFields({
  title,
  content,
  saving,
  onTitle,
  onContent,
  onPersist,
}: {
  title: string;
  content: string;
  saving: boolean;
  onTitle: (value: string) => void;
  onContent: (value: string) => void;
  onPersist: () => void;
}) {
  return (
    <div className="rounded-2xl border border-accent-200 bg-white p-6 shadow-sm">
      <input
        value={title}
        onChange={(e) => onTitle(e.target.value)}
        placeholder="Titre"
        className="mb-3 w-full border-b border-dashed border-accent-300 bg-transparent text-lg font-semibold text-primary-900 outline-none"
      />
      <textarea
        value={content}
        onChange={(e) => onContent(e.target.value)}
        placeholder="Texte de la section"
        rows={5}
        className="w-full resize-y bg-transparent text-sm leading-relaxed text-text-muted outline-none"
      />
      <div className="mt-4">
        <Button size="sm" loading={saving} onClick={onPersist}>
          Enregistrer
        </Button>
      </div>
    </div>
  );
}

function useSectionDraft(
  block: ContentBlock,
  onSave: (data: ContentBlock) => Promise<void>
) {
  const [title, setTitle] = useState(block.title || "");
  const [content, setContent] = useState(block.content || "");
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    setTitle(block.title || "");
    setContent(block.content || "");
  }, [block.key, block.title, block.content]);

  async function persist() {
    await onSave({ key: block.key, title, content });
    setEditing(false);
  }

  return { title, content, editing, setTitle, setContent, setEditing, persist };
}

function wrapWithChrome(
  block: ContentBlock,
  saving: boolean,
  onSave: (data: ContentBlock) => Promise<void>,
  onDelete: () => Promise<void>,
  onAdd: () => Promise<void>,
  view: ReactNode
) {
  return (
    <SectionChrome
      block={block}
      saving={saving}
      onSave={onSave}
      onDelete={onDelete}
      onAdd={onAdd}
      view={view}
    />
  );
}

function SectionChrome({
  block,
  saving,
  onSave,
  onDelete,
  onAdd,
  view,
}: {
  block: ContentBlock;
  saving: boolean;
  onSave: (data: ContentBlock) => Promise<void>;
  onDelete: () => Promise<void>;
  onAdd: () => Promise<void>;
  view: ReactNode;
}) {
  const draft = useSectionDraft(block, onSave);
  return (
    <VisualItemChrome
      label="Section"
      editing={draft.editing}
      disabled={saving}
      onEdit={() => draft.setEditing(true)}
      onDone={() => void draft.persist()}
      onAdd={() => void onAdd()}
      onDelete={() => void onDelete()}
    >
      {draft.editing ? (
        <EditableFields
          title={draft.title}
          content={draft.content}
          saving={saving}
          onTitle={draft.setTitle}
          onContent={draft.setContent}
          onPersist={() => void draft.persist()}
        />
      ) : (
        view
      )}
    </VisualItemChrome>
  );
}

export function SectionBlocksEditor({
  blocks,
  saving,
  onSave,
  onAdd,
  onDelete,
  addLabel = "Ajouter une section",
  emptyLabel = "Aucune section. Ajoutez-en une pour commencer.",
  variant = "default",
  team,
  teamTitle,
}: {
  blocks: ContentBlock[];
  saving: boolean;
  onSave: (data: ContentBlock) => Promise<void>;
  onAdd: () => Promise<void>;
  onDelete: (key: string) => Promise<void>;
  addLabel?: string;
  emptyLabel?: string;
  variant?: "default" | "about" | "homepage";
  team?: AboutTeamMember[];
  teamTitle?: string;
}) {
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
      view
    );
  }

  if (variant === "about") {
    return (
      <div>
        <AboutPageBody
          sections={blocks}
          team={team ?? []}
          teamTitle={teamTitle || "Équipe"}
          wrapSection={(section: AboutSectionItem, index, node) =>
            chrome(section, node ?? <AboutSectionCard section={section} index={index} />)
          }
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
    const [presentation, ...extraSections] = blocks;
    return (
      <div>
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
      {blocks.length === 0 ? (
        <PageSection>
          <p className="text-center text-text-muted">{emptyLabel}</p>
        </PageSection>
      ) : (
        <PageSection>
          <div className="grid gap-6 md:grid-cols-2">
            {blocks.map((block) =>
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
