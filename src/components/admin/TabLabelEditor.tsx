"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

export function TabLabelEditor({
  tabId,
  value,
  fallback,
  saving,
  onSave,
}: {
  tabId: string;
  value: string;
  fallback: string;
  saving: boolean;
  onSave: (label: string) => Promise<void | boolean>;
}) {
  const [draft, setDraft] = useState(value || fallback);

  useEffect(() => {
    setDraft(value || fallback);
  }, [tabId, value, fallback]);

  return (
    <div className="mb-6 rounded-2xl border border-primary-100 bg-white p-4 sm:p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="min-w-0 flex-1">
          <Input
            label="Nom de l'onglet / section"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder={fallback}
          />
        </div>
        <Button
          loading={saving}
          onClick={() => onSave(draft.trim() || fallback)}
        >
          Enregistrer le nom
        </Button>
      </div>
      <p className="mt-2 text-xs text-text-muted">
        Ce nom apparaît dans les onglets admin et sur le site public (menu et titres).
      </p>
    </div>
  );
}
