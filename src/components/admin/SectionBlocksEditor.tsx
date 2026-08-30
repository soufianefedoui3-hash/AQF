"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Input, Textarea } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

export type ContentBlock = {
  key: string;
  title: string | null;
  content: string;
};

function SectionCard({
  block,
  saving,
  onSave,
  onDelete,
}: {
  block: ContentBlock;
  saving: boolean;
  onSave: (data: ContentBlock) => Promise<void>;
  onDelete: () => Promise<void>;
}) {
  const [title, setTitle] = useState(block.title || "");
  const [content, setContent] = useState(block.content || "");

  useEffect(() => {
    setTitle(block.title || "");
    setContent(block.content || "");
  }, [block.key, block.title, block.content]);

  return (
    <div className="rounded-2xl border border-primary-100 bg-white p-6">
      <Input label="Titre" value={title} onChange={(e) => setTitle(e.target.value)} />
      <div className="mt-4">
        <Textarea
          label="Contenu"
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <Button
          loading={saving}
          onClick={() => onSave({ key: block.key, title, content })}
        >
          Enregistrer
        </Button>
        <Button
          type="button"
          variant="danger"
          loading={saving}
          onClick={onDelete}
        >
          <Trash2 className="h-4 w-4" />
          Supprimer
        </Button>
      </div>
    </div>
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
    <div className="space-y-4">
      {blocks.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-primary-100 bg-white p-8 text-center text-text-muted">
          {emptyLabel}
        </p>
      ) : (
        blocks.map((block) => (
          <SectionCard
            key={block.key}
            block={block}
            saving={saving}
            onSave={onSave}
            onDelete={async () => {
              if (!confirm("Supprimer cette section ?")) return;
              await onDelete(block.key);
            }}
          />
        ))
      )}
      <Button type="button" variant="outline" loading={saving} onClick={onAdd}>
        <Plus className="h-4 w-4" />
        {addLabel}
      </Button>
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
