"use client";

import { useState } from "react";
import {
  BlockEditModal,
  CopyFields,
  useDraftValues,
  type EditField,
} from "@/components/admin/BlockEditModal";
import { VisualItemChrome } from "@/components/admin/VisualItemChrome";

export function EditableRegion({
  label,
  disabled,
  fields,
  values,
  onSave,
  onDelete,
  onAdd,
  children,
}: {
  label: string;
  disabled?: boolean;
  fields: EditField[];
  values: Record<string, string>;
  onSave: (values: Record<string, string>) => Promise<unknown> | void;
  onDelete?: () => Promise<unknown> | void;
  onAdd?: () => void;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const { draft, setField } = useDraftValues(values, open);

  async function persist() {
    await onSave(draft);
    setOpen(false);
  }

  return (
    <>
      <VisualItemChrome
        label={label}
        editing={open}
        disabled={disabled}
        onEdit={() => setOpen(true)}
        onDone={() => setOpen(false)}
        onAdd={onAdd}
        onDelete={
          onDelete
            ? () => {
                if (!confirm(`Supprimer « ${label} » ?`)) return;
                void onDelete();
              }
            : undefined
        }
      >
        {children}
      </VisualItemChrome>
      <BlockEditModal
        isOpen={open}
        title={`Modifier — ${label}`}
        saving={disabled}
        onClose={() => setOpen(false)}
        onSave={persist}
      >
        <CopyFields fields={fields} values={draft} onChange={setField} />
      </BlockEditModal>
    </>
  );
}
