"use client";

import { useEffect, useState } from "react";
import { BlockFields } from "@/components/admin/PageBlockBuilder";
import { BlockEditModal, CopyFields } from "@/components/admin/BlockEditModal";
import { useBuilder } from "@/components/admin/builder/BuilderContext";
import type { PageBlock } from "@/lib/page-blocks";

export function BuilderEditModal() {
  const builder = useBuilder();
  const selected = builder?.selected ?? null;
  const open = Boolean(builder?.editorOpen && selected);
  const [draftValues, setDraftValues] = useState<Record<string, string>>({});
  const [draftBlock, setDraftBlock] = useState<PageBlock | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open || !selected) return;
    setDraftValues(selected.values ? { ...selected.values } : {});
    setDraftBlock(selected.block ? structuredClone(selected.block) : null);
  }, [open, selected?.id]);

  if (!builder || !selected) return null;
  const current = selected;
  const ctx = builder;

  async function handleSave() {
    setSaving(true);
    try {
      if (draftBlock) {
        current.onBlockChange?.(draftBlock);
        const result = await current.onPersist?.();
        if (result === false) return;
      } else {
        current.onValuesChange?.(draftValues);
        const result = await current.onPersist?.(draftValues);
        if (result === false) return;
      }
      ctx.markSaved();
      ctx.closeEditor();
    } finally {
      setSaving(false);
    }
  }

  return (
    <BlockEditModal
      isOpen={open}
      title={`Modifier — ${current.label}`}
      saving={saving}
      size="xl"
      onClose={() => ctx.closeEditor()}
      onSave={handleSave}
    >
      {draftBlock ? (
        <BlockFields block={draftBlock} onChange={setDraftBlock} />
      ) : current.fields ? (
        <CopyFields
          fields={current.fields}
          values={draftValues}
          onChange={(key, value) =>
            setDraftValues((prev) => ({ ...prev, [key]: value }))
          }
        />
      ) : (
        <p className="text-sm text-text-muted">Aucun champ éditable.</p>
      )}
    </BlockEditModal>
  );
}
