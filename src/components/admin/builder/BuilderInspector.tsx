"use client";

import { useBuilder } from "@/components/admin/builder/BuilderContext";
import { Button } from "@/components/ui/Button";

export function BuilderInspector({ saving: _saving }: { saving?: boolean }) {
  const builder = useBuilder();

  if (!builder) return null;
  const { selected } = builder;

  if (!selected) {
    return (
      <div className="rounded-2xl border border-dashed border-primary-200 bg-white p-4 text-sm text-text-muted">
        Survolez un bloc, puis cliquez <strong>Modifier</strong> pour l&apos;éditer dans une fenêtre.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-accent-700">
          Sélection
        </p>
        <h3 className="text-base font-semibold text-primary-900">{selected.label}</h3>
        <p className="mt-1 text-xs text-text-muted">
          Les champs s&apos;ouvrent dans une fenêtre plus large.
        </p>
      </div>
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          size="sm"
          onClick={() => builder.openEditor()}
        >
          Modifier
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => void selected.onDuplicate?.()}
        >
          Dupliquer
        </Button>
        <Button
          type="button"
          variant="danger"
          size="sm"
          onClick={() => {
            if (!confirm(`Supprimer « ${selected.label} » ?`)) return;
            void selected.onDelete?.();
            builder.clear();
          }}
        >
          Supprimer
        </Button>
      </div>
    </div>
  );
}
