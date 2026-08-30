"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { BlockFields } from "@/components/admin/PageBlockBuilder";
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
    <div className="mx-4 my-3 rounded-2xl border border-accent-200 bg-white p-4 shadow-lg sm:mx-8">
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
    <div className="bg-white">
      {blocks.length === 0 && insertAt === null ? (
        <div className="px-6 py-16 text-center">
          <p className="text-text-muted">Cette page n’a pas encore de blocs visuels.</p>
          <Button
            type="button"
            variant="outline"
            className="mt-4"
            disabled={saving}
            onClick={() => setInsertAt(0)}
          >
            <Plus className="h-4 w-4" />
            Ajouter un bloc ici
          </Button>
        </div>
      ) : null}

      {insertAt === 0 ? <BlockTypePicker onPick={pickType} onClose={() => setInsertAt(null)} /> : null}

      {blocks.map((block, index) => {
        const editing = editingId === block.id;
        return (
          <div key={block.id}>
            <VisualItemChrome
              label={PAGE_BLOCK_LABELS[block.type]}
              editing={editing}
              disabled={saving}
              onEdit={() => setEditingId(block.id)}
              onDone={() => {
                setEditingId(null);
                void onPersist?.(blocks);
              }}
              onAdd={() => setInsertAt(index + 1)}
              onDelete={() => {
                if (!confirm("Supprimer cet élément ?")) return;
                const next = blocks.filter((item) => item.id !== block.id);
                if (editingId === block.id) setEditingId(null);
                void commit(next);
              }}
            >
              {editing ? (
                <div className="bg-surface-muted/40 px-4 py-8 sm:px-8">
                  <div className="mx-auto max-w-3xl rounded-2xl border border-accent-200 bg-white p-5 shadow-sm sm:p-6">
                    <p className="mb-4 text-xs font-semibold uppercase tracking-wide text-accent-700">
                      Édition — {PAGE_BLOCK_LABELS[block.type]}
                    </p>
                    <BlockFields
                      block={block}
                      onChange={(nextBlock) =>
                        onChange(blocks.map((item) => (item.id === block.id ? nextBlock : item)))
                      }
                    />
                    <div className="mt-4">
                      <Button
                        type="button"
                        size="sm"
                        disabled={saving}
                        onClick={() => {
                          setEditingId(null);
                          void onPersist?.(blocks);
                        }}
                      >
                        Enregistrer ce bloc
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                <PageBlockView
                  block={block}
                  muted={index % 2 === 1}
                  showPlaceholders
                  compact
                />
              )}
            </VisualItemChrome>
            {insertAt === index + 1 ? (
              <BlockTypePicker onPick={pickType} onClose={() => setInsertAt(null)} />
            ) : (
              <button
                type="button"
                disabled={saving}
                onClick={() => setInsertAt(index + 1)}
                className="mx-auto flex h-0 w-full items-center justify-center overflow-hidden text-xs font-medium text-accent-700 opacity-0 transition hover:h-10 hover:opacity-100 focus:h-10 focus:opacity-100"
              >
                + Ajouter un bloc ici
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}
