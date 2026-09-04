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
    if (created) {
      bindBlock(created);
      builder?.openEditor();
    }
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

  function replaceBlock(nextBlock: PageBlock) {
    const next = blocksRef.current.map((item) => (item.id === nextBlock.id ? nextBlock : item));
    blocksRef.current = next;
    onChange(next);
    return next;
  }

  function bindGridItem(block: Extract<PageBlock, { type: "grid" }>, index: number) {
    if (!builder) return;
    const item = block.items[index];
    if (!item) return;
    builder.select({
      id: `${block.id}-grid-${index}`,
      label: `Carte ${index + 1}`,
      fields: [
        { key: "title", label: "Titre" },
        { key: "content", label: "Texte", type: "textarea", rows: 4 },
      ],
      values: { title: item.title, content: item.content },
      onValuesChange: (next) => {
        const latest = blocksRef.current.find((entry) => entry.id === block.id);
        if (!latest || latest.type !== "grid") return;
        replaceBlock({
          ...latest,
          items: latest.items.map((entry, entryIndex) =>
            entryIndex === index ? { title: next.title, content: next.content } : entry
          ),
        });
      },
      onPersist: () => onPersist?.(blocksRef.current),
      onDuplicate: () => void duplicateGridItem(block.id, index),
      onDelete: () => void deleteGridItem(block.id, index),
    });
  }

  function bindStatItem(block: Extract<PageBlock, { type: "stats" }>, index: number) {
    if (!builder) return;
    const item = block.items[index];
    if (!item) return;
    builder.select({
      id: `${block.id}-stat-${index}`,
      label: `Compteur ${index + 1}`,
      fields: [
        { key: "value", label: "Valeur" },
        { key: "label", label: "Libellé" },
      ],
      values: { value: item.value, label: item.label },
      onValuesChange: (next) => {
        const latest = blocksRef.current.find((entry) => entry.id === block.id);
        if (!latest || latest.type !== "stats") return;
        replaceBlock({
          ...latest,
          items: latest.items.map((entry, entryIndex) =>
            entryIndex === index ? { value: next.value, label: next.label } : entry
          ),
        });
      },
      onPersist: () => onPersist?.(blocksRef.current),
      onDuplicate: () => void duplicateStatItem(block.id, index),
      onDelete: () => void deleteStatItem(block.id, index),
    });
  }

  function duplicateGridItem(blockId: string, index: number) {
    const latest = blocksRef.current.find((entry) => entry.id === blockId);
    if (!latest || latest.type !== "grid") return;
    const source = latest.items[index];
    if (!source) return;
    const items = [...latest.items];
    items.splice(index + 1, 0, { title: source.title, content: source.content });
    void commit(replaceBlock({ ...latest, items }));
  }

  function deleteGridItem(blockId: string, index: number) {
    const latest = blocksRef.current.find((entry) => entry.id === blockId);
    if (!latest || latest.type !== "grid") return;
    if (!confirm("Supprimer cette carte ?")) return;
    const items = latest.items.filter((_, itemIndex) => itemIndex !== index);
    void commit(replaceBlock({ ...latest, items }));
    builder?.clear();
  }

  function duplicateStatItem(blockId: string, index: number) {
    const latest = blocksRef.current.find((entry) => entry.id === blockId);
    if (!latest || latest.type !== "stats") return;
    const source = latest.items[index];
    if (!source) return;
    const items = [...latest.items];
    items.splice(index + 1, 0, { value: source.value, label: source.label });
    void commit(replaceBlock({ ...latest, items }));
  }

  function deleteStatItem(blockId: string, index: number) {
    const latest = blocksRef.current.find((entry) => entry.id === blockId);
    if (!latest || latest.type !== "stats") return;
    if (!confirm("Supprimer ce compteur ?")) return;
    const items = latest.items.filter((_, itemIndex) => itemIndex !== index);
    void commit(replaceBlock({ ...latest, items }));
    builder?.clear();
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
              fit="section"
              onSelect={() => bindBlock(block)}
              onEdit={() => {
                bindBlock(block);
                builder?.openEditor();
              }}
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
                wrapGridItem={(_item, itemIndex, node) => {
                  const source = block.type === "grid" ? block : null;
                  if (!source) return node;
                  const itemId = `${block.id}-grid-${itemIndex}`;
                  return (
                    <VisualItemChrome
                      label={`Carte ${itemIndex + 1}`}
                      editing={builder?.selected?.id === itemId}
                      disabled={saving}
                      onSelect={() => bindGridItem(source, itemIndex)}
                      onEdit={() => {
                        bindGridItem(source, itemIndex);
                        builder?.openEditor();
                      }}
                      onDuplicate={() => duplicateGridItem(block.id, itemIndex)}
                      onDelete={() => void deleteGridItem(block.id, itemIndex)}
                    >
                      {node}
                    </VisualItemChrome>
                  );
                }}
                wrapStatItem={(_item, itemIndex, node) => {
                  const source = block.type === "stats" ? block : null;
                  if (!source) return node;
                  const itemId = `${block.id}-stat-${itemIndex}`;
                  return (
                    <VisualItemChrome
                      label={`Compteur ${itemIndex + 1}`}
                      editing={builder?.selected?.id === itemId}
                      disabled={saving}
                      onSelect={() => bindStatItem(source, itemIndex)}
                      onEdit={() => {
                        bindStatItem(source, itemIndex);
                        builder?.openEditor();
                      }}
                      onDuplicate={() => duplicateStatItem(block.id, itemIndex)}
                      onDelete={() => void deleteStatItem(block.id, itemIndex)}
                    >
                      {node}
                    </VisualItemChrome>
                  );
                }}
              />
            </VisualItemChrome>
            <InsertRail disabled={saving} onAdd={() => builder?.setInsertAt(index + 1)} />
          </div>
        );
      })}
    </div>
  );
}
