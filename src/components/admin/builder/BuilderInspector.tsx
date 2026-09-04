"use client";

import { useEffect, useRef } from "react";
import { BlockFields } from "@/components/admin/PageBlockBuilder";
import { CopyFields } from "@/components/admin/BlockEditModal";
import { useBuilder } from "@/components/admin/builder/BuilderContext";
import { Button } from "@/components/ui/Button";

export function BuilderInspector({ saving }: { saving?: boolean }) {
  const builder = useBuilder();
  const persistTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const persistRef = useRef(builder?.selected?.onPersist);
  persistRef.current = builder?.selected?.onPersist;

  useEffect(() => {
    return () => {
      if (persistTimer.current) clearTimeout(persistTimer.current);
    };
  }, []);

  if (!builder) return null;
  const { selected, patchValues, patchBlock, markSaved } = builder;

  function schedulePersist(values?: Record<string, string>) {
    if (!persistRef.current) return;
    if (persistTimer.current) clearTimeout(persistTimer.current);
    persistTimer.current = setTimeout(() => {
      void Promise.resolve(persistRef.current?.(values)).then(() => markSaved());
    }, 450);
  }

  if (!selected) {
    return (
      <div className="rounded-2xl border border-dashed border-primary-200 bg-white p-4 text-sm text-text-muted">
        Cliquez un élément sur la page pour afficher ses champs ici.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-accent-700">
          Propriétés
        </p>
        <h3 className="text-base font-semibold text-primary-900">{selected.label}</h3>
      </div>

      {selected.block ? (
        <BlockFields block={selected.block} onChange={(next) => {
          patchBlock(next);
          schedulePersist();
        }} />
      ) : selected.fields && selected.values ? (
        <CopyFields
          fields={selected.fields}
          values={selected.values}
          onChange={(key, value) => {
            const next = { ...selected.values, [key]: value };
            patchValues(next);
            schedulePersist(next);
          }}
        />
      ) : (
        <p className="text-sm text-text-muted">Aucun champ éditable.</p>
      )}

      <div className="flex flex-wrap gap-2">
        {selected.onPersist ? (
          <Button
            type="button"
            size="sm"
            loading={saving}
            onClick={() => void Promise.resolve(selected.onPersist?.()).then(() => markSaved())}
          >
            Enregistrer
          </Button>
        ) : null}
        {selected.onDuplicate ? (
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={saving}
            onClick={() => void selected.onDuplicate?.()}
          >
            Dupliquer
          </Button>
        ) : null}
        {selected.onDelete ? (
          <Button
            type="button"
            variant="danger"
            size="sm"
            disabled={saving}
            onClick={() => {
              if (!confirm(`Supprimer « ${selected.label} » ?`)) return;
              void selected.onDelete?.();
              builder.clear();
            }}
          >
            Supprimer
          </Button>
        ) : null}
      </div>
    </div>
  );
}
