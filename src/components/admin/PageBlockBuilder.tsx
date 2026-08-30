"use client";

import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";
import { Input, Textarea } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import {
  PAGE_BLOCK_LABELS,
  PAGE_BLOCK_TYPES,
  createEmptyBlock,
  type PageBlock,
  type PageBlockType,
} from "@/lib/page-blocks";

function updateBlock(blocks: PageBlock[], id: string, next: PageBlock): PageBlock[] {
  return blocks.map((block) => (block.id === id ? next : block));
}

function moveBlock(blocks: PageBlock[], id: string, direction: -1 | 1): PageBlock[] {
  const index = blocks.findIndex((block) => block.id === id);
  const target = index + direction;
  if (index < 0 || target < 0 || target >= blocks.length) return blocks;
  const next = [...blocks];
  const [item] = next.splice(index, 1);
  next.splice(target, 0, item);
  return next;
}

function BlockFields({
  block,
  onChange,
}: {
  block: PageBlock;
  onChange: (next: PageBlock) => void;
}) {
  if (block.type === "cta") {
    return (
      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          label="Texte du bouton"
          value={block.label}
          onChange={(e) => onChange({ ...block, label: e.target.value })}
        />
        <Input
          label="Lien"
          value={block.href}
          placeholder="/services ou https://…"
          onChange={(e) => onChange({ ...block, href: e.target.value })}
        />
      </div>
    );
  }

  if (block.type === "list") {
    return (
      <div className="space-y-4">
        <Input
          label="Titre"
          value={block.title}
          onChange={(e) => onChange({ ...block, title: e.target.value })}
        />
        <Textarea
          label="Points clés (un par ligne)"
          value={block.items.join("\n")}
          onChange={(e) =>
            onChange({
              ...block,
              items: e.target.value.split("\n"),
            })
          }
        />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Input
        label="Titre"
        value={block.title}
        onChange={(e) => onChange({ ...block, title: e.target.value })}
      />
      <Textarea
        label="Texte"
        value={block.content}
        onChange={(e) => onChange({ ...block, content: e.target.value })}
      />
    </div>
  );
}

export function PageBlockBuilder({
  blocks,
  saving,
  onChange,
  onAdd,
}: {
  blocks: PageBlock[];
  saving: boolean;
  onChange: (blocks: PageBlock[]) => void;
  onAdd?: (type: PageBlockType) => void;
}) {
  function add(type: PageBlockType) {
    const next = createEmptyBlock(type);
    onChange([...blocks, next]);
    onAdd?.(type);
  }

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-dashed border-primary-200 bg-white p-4">
        <p className="mb-3 text-sm font-medium text-primary-900">Ajouter un bloc</p>
        <div className="flex flex-wrap gap-2">
          {PAGE_BLOCK_TYPES.map((type) => (
            <Button
              key={type}
              type="button"
              variant="outline"
              size="sm"
              disabled={saving}
              onClick={() => add(type)}
            >
              <Plus className="h-4 w-4" />
              {PAGE_BLOCK_LABELS[type]}
            </Button>
          ))}
        </div>
      </div>

      {blocks.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-primary-100 bg-white p-8 text-center text-text-muted">
          Aucun bloc pour l&apos;instant. Choisissez un type ci-dessus pour construire la page.
        </p>
      ) : (
        blocks.map((block, index) => (
          <div
            key={block.id}
            className="rounded-2xl border border-primary-100 bg-white p-5 sm:p-6"
          >
            <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
              <span className="rounded-full bg-accent-50 px-3 py-1 text-xs font-medium text-primary-800">
                {index + 1}. {PAGE_BLOCK_LABELS[block.type]}
              </span>
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  disabled={saving || index === 0}
                  onClick={() => onChange(moveBlock(blocks, block.id, -1))}
                >
                  <ArrowUp className="h-4 w-4" />
                  Monter
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  disabled={saving || index === blocks.length - 1}
                  onClick={() => onChange(moveBlock(blocks, block.id, 1))}
                >
                  <ArrowDown className="h-4 w-4" />
                  Descendre
                </Button>
                <Button
                  type="button"
                  variant="danger"
                  size="sm"
                  disabled={saving}
                  onClick={() => {
                    if (!confirm("Supprimer ce bloc ?")) return;
                    onChange(blocks.filter((item) => item.id !== block.id));
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                  Supprimer
                </Button>
              </div>
            </div>
            <BlockFields
              block={block}
              onChange={(next) => onChange(updateBlock(blocks, block.id, next))}
            />
          </div>
        ))
      )}
    </div>
  );
}
