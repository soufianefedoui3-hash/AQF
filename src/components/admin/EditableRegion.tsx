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
  onDuplicate,
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
  onDuplicate?: () => Promise<unknown> | void;
  onAdd?: () => void;
  children: React.ReactNode;
}) {
  const reactId = useId();
  const regionId = id || `region-${reactId}`;
  const builder = useBuilder();
  const latest = useRef({ values, onSave, onChange, onDelete, onDuplicate, label, fields });
  latest.current = { values, onSave, onChange, onDelete, onDuplicate, label, fields };
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
      onDuplicate: () => {
        if (latest.current.onDuplicate) return latest.current.onDuplicate();
        return latest.current.onSave({ ...latest.current.values });
      },
      onDelete: () => {
        if (latest.current.onDelete) return latest.current.onDelete();
        const empty = Object.fromEntries(
          latest.current.fields.map((field) => [field.key, ""])
        );
        return latest.current.onSave(empty);
      },
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
        onEdit={() => {
          bindSelection();
          builder.openEditor();
        }}
        onDuplicate={
          onDuplicate
            ? () => void onDuplicate()
            : () => {
                const copy = Object.fromEntries(
                  Object.entries(latest.current.values).map(([key, value]) => [
                    key,
                    value,
                  ])
                );
                void latest.current.onSave(copy);
              }
        }
        onDelete={() => {
          if (!confirm(`Supprimer « ${label} » ?`)) return;
          if (onDelete) {
            void onDelete();
          } else {
            const empty = Object.fromEntries(
              latest.current.fields.map((field) => [field.key, ""])
            );
            void latest.current.onSave(empty);
          }
          if (selected) builder.clear();
        }}
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
      onDuplicate={onDuplicate}
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
  onDuplicate,
  onAdd,
  children,
}: {
  label: string;
  disabled?: boolean;
  fields: EditField[];
  values: Record<string, string>;
  onSave: (values: Record<string, string>) => Promise<unknown> | void;
  onDelete?: () => Promise<unknown> | void;
  onDuplicate?: () => Promise<unknown> | void;
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
        onDuplicate={
          onDuplicate
            ? () => void onDuplicate()
            : () => void onSave({ ...values })
        }
        onDelete={() => {
          if (!confirm(`Supprimer « ${label} » ?`)) return;
          if (onDelete) void onDelete();
          else {
            const empty = Object.fromEntries(fields.map((field) => [field.key, ""]));
            void onSave(empty);
          }
        }}
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
