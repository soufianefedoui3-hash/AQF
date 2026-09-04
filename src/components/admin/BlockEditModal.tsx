"use client";

import { useEffect, useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input, Textarea } from "@/components/ui/Input";
import { ImageField } from "@/components/admin/ImageField";

export type EditField = {
  key: string;
  label: string;
  type?: "text" | "textarea" | "image";
  rows?: number;
  placeholder?: string;
  prefix?: string;
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
    <div className="space-y-5">
      {fields.map((field) =>
        field.type === "image" ? (
          <ImageField
            key={field.key}
            label={field.label}
            prefix={field.prefix || field.key}
            value={values[field.key] ?? ""}
            onChange={(url) => onChange(field.key, url)}
          />
        ) : field.type === "textarea" ? (
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
  size = "lg",
  children,
}: {
  isOpen: boolean;
  title: string;
  saving?: boolean;
  onClose: () => void;
  onSave: () => Promise<void> | void;
  size?: "md" | "lg" | "xl";
  children: React.ReactNode;
}) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size={size}>
      <div className="space-y-6">
        <p className="text-sm text-text-muted">
          Modifiez les champs ci-dessous, puis enregistrez pour mettre à jour la page.
        </p>
        {children}
        <div className="sticky bottom-0 -mx-6 -mb-6 flex justify-end gap-3 border-t border-primary-50 bg-white px-6 py-4">
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
