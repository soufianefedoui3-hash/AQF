"use client";

import { useEffect, useId, useRef, useState } from "react";
import {
  BlockEditModal,
  CopyFields,
  useDraftValues,
  type EditField,
} from "@/components/admin/BlockEditModal";
import { useBuilder } from "@/components/admin/builder/BuilderContext";
import { VisualItemChrome } from "@/components/admin/VisualItemChrome";

export function EditableRegion({
  id,
  label,
  disabled,
  fields,
  values,
  onSave,
  onChange,
  onDelete,
  onAdd,
  children,
}: {
  id?: string;
  label: string;
  disabled?: boolean;
  fields: EditField[];
  values: Record<string, string>;
  onSave: (values: Record<string, string>) => Promise<unknown> | void;
  onChange?: (values: Record<string, string>) => void;
  onDelete?: () => Promise<unknown> | void;
  onAdd?: () => void;
  children: React.ReactNode;
}) {
  const reactId = useId();
  const regionId = id || `region-${reactId}`;
  const builder = useBuilder();
  const latest = useRef({ values, onSave, onChange, onDelete, label, fields });
  latest.current = { values, onSave, onChange, onDelete, label, fields };
  const selected = builder?.selected?.id === regionId;

  function bindSelection() {
    if (!builder) return;
    builder.select({
      id: regionId,
      label: latest.current.label,
      fields: latest.current.fields,
      values: latest.current.values,
      onValuesChange: (next) => {
        latest.current.onChange?.(next);
      },
      onPersist: (override) =>
        latest.current.onSave(override ?? builder.selected?.values ?? latest.current.values),
      onDelete: latest.current.onDelete,
    });
  }

  useEffect(() => {
    if (builder && selected) bindSelection();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [regionId, selected, values]);

  if (builder) {
    return (
      <VisualItemChrome
        label={label}
        editing={selected}
        disabled={disabled}
        onSelect={bindSelection}
        onEdit={bindSelection}
        onDone={() => builder.clear()}
        onAdd={onAdd}
        onDelete={
          onDelete
            ? () => {
                if (!confirm(`Supprimer « ${label} » ?`)) return;
                void onDelete();
                if (selected) builder.clear();
              }
            : undefined
        }
      >
        {children}
      </VisualItemChrome>
    );
  }

  return (
    <ModalFallback
      label={label}
      disabled={disabled}
      fields={fields}
      values={values}
      onSave={onSave}
      onDelete={onDelete}
      onAdd={onAdd}
    >
      {children}
    </ModalFallback>
  );
}

function ModalFallback({
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
        onSave={async () => {
          await onSave(draft);
          setOpen(false);
        }}
      >
        <CopyFields fields={fields} values={draft} onChange={setField} />
      </BlockEditModal>
    </>
  );
}
