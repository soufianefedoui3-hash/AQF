"use client";

import { useRef } from "react";
import { Plus } from "lucide-react";
import { BlockInsertDrawer } from "@/components/admin/builder/BlockInsertDrawer";
import { InsertRail } from "@/components/admin/builder/InsertRail";
import { useBuilder } from "@/components/admin/builder/BuilderContext";
import { VisualItemChrome } from "@/components/admin/VisualItemChrome";
import { PageBlockView } from "@/components/content/PageBlockView";
import { Button } from "@/components/ui/Button";
import {
  PAGE_BLOCK_LABELS,
  clonePageBlock,
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
  const builder = useBuilder();
  const insertAt = builder?.insertAt ?? null;
  const blocksRef = useRef(blocks);
  blocksRef.current = blocks;

  async function commit(next: PageBlock[]) {
    onChange(next);
    await onPersist?.(next);
    builder?.markSaved();
  }

  function pickType(type: PageBlockType) {
    const index = insertAt ?? blocksRef.current.length;
    const next = insertBlock(blocksRef.current, index, type);
    const created = next[index];
    builder?.setInsertAt(null);
    void commit(next);
    if (created) bindBlock(created);
  }

  function bindBlock(block: PageBlock) {
    if (!builder) return;
    builder.select({
      id: block.id,
      label: PAGE_BLOCK_LABELS[block.type],
      block,
      onBlockChange: (nextBlock) => {
        const next = blocksRef.current.map((item) => (item.id === nextBlock.id ? nextBlock : item));
        blocksRef.current = next;
        onChange(next);
      },
      onPersist: () => onPersist?.(blocksRef.current),
      onDuplicate: () => void duplicateBlock(block.id),
      onDelete: () => {
        const next = blocksRef.current.filter((item) => item.id !== block.id);
        void commit(next);
      },
    });
  }

  function duplicateBlock(blockId: string) {
    const current = blocksRef.current;
    const index = current.findIndex((item) => item.id === blockId);
    if (index < 0) return;
    const clone = clonePageBlock(current[index]);
    const next = [...current];
    next.splice(index + 1, 0, clone);
    void commit(next);
    bindBlock(clone);
  }

  return (
    <div className="relative bg-white">
      <BlockInsertDrawer
        open={insertAt !== null}
        onClose={() => builder?.setInsertAt(null)}
        onPick={pickType}
      />

      {blocks.length === 0 ? (
        <div className="flex justify-center px-4 py-10">
          <Button
            type="button"
            variant="outline"
            className="shadow-sm"
            disabled={saving}
            onClick={() => builder?.setInsertAt(0)}
          >
            <Plus className="h-4 w-4" />
            Ajouter un bloc
          </Button>
        </div>
      ) : (
        <InsertRail disabled={saving} onAdd={() => builder?.setInsertAt(0)} />
      )}

      {blocks.map((block, index) => {
        const editing = builder?.selected?.id === block.id;
        return (
          <div key={block.id}>
            <VisualItemChrome
              label={PAGE_BLOCK_LABELS[block.type]}
              editing={editing}
              disabled={saving}
              onSelect={() => bindBlock(block)}
              onEdit={() => bindBlock(block)}
              onDone={() => builder?.clear()}
              onDuplicate={() => duplicateBlock(block.id)}
              onDelete={() => {
                if (!confirm("Supprimer cet élément ?")) return;
                const next = blocksRef.current.filter((item) => item.id !== block.id);
                if (editing) builder?.clear();
                void commit(next);
              }}
            >
              <PageBlockView
                block={editing && builder?.selected?.block ? builder.selected.block : block}
                muted={index % 2 === 1}
                showPlaceholders
              />
            </VisualItemChrome>
            <InsertRail disabled={saving} onAdd={() => builder?.setInsertAt(index + 1)} />
          </div>
        );
      })}
    </div>
  );
}
