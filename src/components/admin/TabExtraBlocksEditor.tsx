"use client";

import { useEffect, useState } from "react";
import { VisualBlockCanvas } from "@/components/admin/VisualBlockCanvas";
import { Button } from "@/components/ui/Button";
import type { PageBlock } from "@/lib/page-blocks";

export function TabExtraBlocksEditor({
  tabId,
  initialBlocks,
  saving,
  onSave,
}: {
  tabId: string;
  initialBlocks: PageBlock[];
  saving: boolean;
  onSave: (blocks: PageBlock[]) => Promise<void>;
}) {
  const [blocks, setBlocks] = useState<PageBlock[]>(initialBlocks);
  const signature = initialBlocks.map((block) => block.id).join(",");

  useEffect(() => {
    setBlocks(initialBlocks);
    // Sync from server when the tab or saved block ids change — not on every parent render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tabId, signature]);

  return (
    <div>
      <div className="border-t border-primary-50 bg-surface-muted/40 px-6 py-4">
        <h3 className="text-sm font-semibold text-primary-900">Blocs modulaires</h3>
        <p className="mt-1 text-xs text-text-muted">
          Titres, alertes, citations, grilles, FAQ, vidéos, statistiques et plus — insérés
          n’importe où sur la page publique.
        </p>
      </div>
      <VisualBlockCanvas
        blocks={blocks}
        saving={saving}
        onChange={setBlocks}
        onPersist={onSave}
      />
      <div className="border-t border-primary-50 bg-white px-6 py-4 text-center">
        <Button loading={saving} onClick={() => onSave(blocks)}>
          Enregistrer les blocs
        </Button>
      </div>
    </div>
  );
}
