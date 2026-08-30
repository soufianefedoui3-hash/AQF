"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { BlockFields } from "@/components/admin/PageBlockBuilder";
import { BlockEditModal } from "@/components/admin/BlockEditModal";
import { VisualItemChrome } from "@/components/admin/VisualItemChrome";
import { PageBlockView } from "@/components/content/PageBlockView";
import { Button } from "@/components/ui/Button";
import {
  PAGE_BLOCK_LABELS,
  PAGE_BLOCK_TYPES,
  createEmptyBlock,
  type PageBlock,
  type PageBlockType,
} from "@/lib/page-blocks";

function insertBlock(
  blocks: PageBlock[],
  index: number,
  type: PageBlockType
): PageBlock[] {
  const next = [...blocks];
  next.splice(index, 0, createEmptyBlock(type));
  return next;
}

function BlockTypePicker({
  onPick,
  onClose,
}: {
  onPick: (type: PageBlockType) => void;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center bg-primary-900/40 p-4"
      onClick={onClose}
    >
      <div
        className="max-h-[80vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-accent-200 bg-white p-5 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-3 flex items-center justify-between gap-3">
          <p className="text-sm font-semibold text-primary-900">Ajouter un bloc ici</p>
          <button
            type="button"
            onClick={onClose}
            className="text-xs font-medium text-text-muted hover:text-primary-900"
          >
            Fermer
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {PAGE_BLOCK_TYPES.map((type) => (
            <Button
              key={type}
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onPick(type)}
            >
              <Plus className="h-4 w-4" />
              {PAGE_BLOCK_LABELS[type]}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}

export function VisualBlockCanvas({
  blocks,
  saving,
  onChange,
  onPersist,
}: {
  blocks: PageBlock[];
  saving: boolean;
  onChange: (blocks: PageBlock[]) => void;
  onPersist?: (blocks: PageBlock[]) => Promise<void> | void;
}) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [insertAt, setInsertAt] = useState<number | null>(null);

  async function commit(next: PageBlock[]) {
    onChange(next);
    await onPersist?.(next);
  }

  function pickType(type: PageBlockType) {
    const index = insertAt ?? blocks.length;
    const next = insertBlock(blocks, index, type);
    const created = next[index];
    setInsertAt(null);
    setEditingId(created?.id ?? null);
    void commit(next);
  }

  return (
    <div className="relative bg-white">
      {insertAt !== null ? (
        <BlockTypePicker onPick={pickType} onClose={() => setInsertAt(null)} />
      ) : null}
      {editingId ? (
        <BlockEditModal
          isOpen
          title={`Modifier — ${PAGE_BLOCK_LABELS[blocks.find((item) => item.id === editingId)?.type || "heading"]}`}
          saving={saving}
          onClose={() => setEditingId(null)}
          onSave={async () => {
            await onPersist?.(blocks);
            setEditingId(null);
          }}
        >
          {blocks
            .filter((item) => item.id === editingId)
            .map((block) => (
              <BlockFields
                key={block.id}
                block={block}
                onChange={(nextBlock) =>
                  onChange(blocks.map((item) => (item.id === block.id ? nextBlock : item)))
                }
              />
            ))}
        </BlockEditModal>
      ) : null}

      {blocks.length === 0 ? (
        <div className="pointer-events-none absolute inset-x-0 top-4 z-20 flex justify-center">
          <Button
            type="button"
            variant="outline"
            className="pointer-events-auto shadow-sm"
            disabled={saving}
            onClick={() => setInsertAt(0)}
          >
            <Plus className="h-4 w-4" />
            Ajouter un bloc ici
          </Button>
        </div>
      ) : null}

      {blocks.map((block, index) => {
        const editing = editingId === block.id;
        return (
          <VisualItemChrome
            key={block.id}
            label={PAGE_BLOCK_LABELS[block.type]}
            editing={editing}
            disabled={saving}
            onEdit={() => setEditingId(block.id)}
            onAdd={() => setInsertAt(index + 1)}
            onDelete={() => {
              if (!confirm("Supprimer cet élément ?")) return;
              const next = blocks.filter((item) => item.id !== block.id);
              if (editingId === block.id) setEditingId(null);
              void commit(next);
            }}
          >
            <PageBlockView
              block={block}
              muted={index % 2 === 1}
              showPlaceholders
            />
          </VisualItemChrome>
        );
      })}
    </div>
  );
}
