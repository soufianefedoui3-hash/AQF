"use client";

import { useEffect, useState } from "react";
import { PageBlockBuilder } from "@/components/admin/PageBlockBuilder";
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
    <div className="mt-8 space-y-4 border-t border-primary-100 pt-8">
      <div>
        <h3 className="text-lg font-semibold text-primary-900">Blocs modulaires</h3>
        <p className="mt-1 text-sm text-text-muted">
          Ajoutez titres, alertes, citations, grilles, FAQ, vidéos, statistiques et plus.
          Ils apparaissent sur la page publique correspondante.
        </p>
      </div>
      <PageBlockBuilder blocks={blocks} saving={saving} onChange={setBlocks} />
      <Button loading={saving} onClick={() => onSave(blocks)}>
        Enregistrer les blocs
      </Button>
    </div>
  );
}
