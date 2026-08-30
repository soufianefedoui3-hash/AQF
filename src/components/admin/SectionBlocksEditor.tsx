"use client";

import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { VisualItemChrome } from "@/components/admin/VisualItemChrome";
import { ContentCard, PageSection } from "@/components/ui/PageSection";
import { Button } from "@/components/ui/Button";

export type ContentBlock = {
  key: string;
  title: string | null;
  content: string;
};

function SectionCard({
  block,
  muted,
  saving,
  onSave,
  onDelete,
  onAdd,
}: {
  block: ContentBlock;
  muted: boolean;
  saving: boolean;
  onSave: (data: ContentBlock) => Promise<void>;
  onDelete: () => Promise<void>;
  onAdd: () => Promise<void>;
}) {
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

  return (
    <VisualItemChrome
      label="Section"
      editing={editing}
      disabled={saving}
      onEdit={() => setEditing(true)}
      onDone={() => void persist()}
      onAdd={() => void onAdd()}
      onDelete={() => void onDelete()}
    >
      <PageSection container="3xl" muted={muted} className="py-10 md:py-12">
        {editing ? (
          <ContentCard>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Titre"
              className="mb-3 w-full border-b border-dashed border-accent-300 bg-transparent text-lg font-semibold text-primary-900 outline-none"
            />
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Texte de la section"
              rows={5}
              className="w-full resize-y bg-transparent text-sm leading-relaxed text-text-muted outline-none"
            />
            <div className="mt-4">
              <Button size="sm" loading={saving} onClick={() => void persist()}>
                Enregistrer
              </Button>
            </div>
          </ContentCard>
        ) : (
          <ContentCard>
            <h2 className="mb-3 text-lg font-semibold text-primary-900">
              {title || "Nouvelle section"}
            </h2>
            <p className="whitespace-pre-line text-sm leading-relaxed text-text-muted">
              {content || "Cliquez sur Modifier pour rédiger cette section."}
            </p>
          </ContentCard>
        )}
      </PageSection>
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
}: {
  blocks: ContentBlock[];
  saving: boolean;
  onSave: (data: ContentBlock) => Promise<void>;
  onAdd: () => Promise<void>;
  onDelete: (key: string) => Promise<void>;
  addLabel?: string;
  emptyLabel?: string;
}) {
  return (
    <div>
      {blocks.length === 0 ? (
        <PageSection container="3xl" className="py-12">
          <p className="text-center text-text-muted">{emptyLabel}</p>
        </PageSection>
      ) : (
        blocks.map((block, index) => (
          <SectionCard
            key={block.key}
            block={block}
            muted={index % 2 === 1}
            saving={saving}
            onSave={onSave}
            onAdd={onAdd}
            onDelete={async () => {
              if (!confirm("Supprimer cette section ?")) return;
              await onDelete(block.key);
            }}
          />
        ))
      )}
      <div className="px-6 pb-8 text-center">
        <Button type="button" variant="outline" loading={saving} onClick={onAdd}>
          <Plus className="h-4 w-4" />
          {addLabel}
        </Button>
      </div>
    </div>
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
