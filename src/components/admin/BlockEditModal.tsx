"use client";

import { useEffect, useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input, Textarea } from "@/components/ui/Input";

export type EditField = {
  key: string;
  label: string;
  type?: "text" | "textarea";
  rows?: number;
  placeholder?: string;
};

export function CopyFields({
  fields,
  values,
  onChange,
}: {
  fields: EditField[];
  values: Record<string, string>;
  onChange: (key: string, value: string) => void;
}) {
  return (
    <div className="space-y-4">
      {fields.map((field) =>
        field.type === "textarea" ? (
          <Textarea
            key={field.key}
            label={field.label}
            rows={field.rows ?? 5}
            placeholder={field.placeholder}
            value={values[field.key] ?? ""}
            onChange={(e) => onChange(field.key, e.target.value)}
          />
        ) : (
          <Input
            key={field.key}
            label={field.label}
            placeholder={field.placeholder}
            value={values[field.key] ?? ""}
            onChange={(e) => onChange(field.key, e.target.value)}
          />
        )
      )}
    </div>
  );
}

export function BlockEditModal({
  isOpen,
  title,
  saving,
  onClose,
  onSave,
  children,
}: {
  isOpen: boolean;
  title: string;
  saving?: boolean;
  onClose: () => void;
  onSave: () => Promise<void> | void;
  children: React.ReactNode;
}) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="lg">
      <div className="space-y-5">
        {children}
        <div className="flex justify-end gap-2">
          <Button type="button" variant="ghost" disabled={saving} onClick={onClose}>
            Annuler
          </Button>
          <Button type="button" loading={saving} onClick={() => void onSave()}>
            Enregistrer
          </Button>
        </div>
      </div>
    </Modal>
  );
}

export function useDraftValues(values: Record<string, string>, open: boolean) {
  const [draft, setDraft] = useState(values);

  useEffect(() => {
    if (open) setDraft(values);
  }, [open, values]);

  return {
    draft,
    setField: (key: string, value: string) =>
      setDraft((prev) => ({ ...prev, [key]: value })),
    setDraft,
  };
}
