"use client";

import { useEffect, useState } from "react";
import { VisualBlockCanvas } from "@/components/admin/VisualBlockCanvas";
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
    <VisualBlockCanvas
      blocks={blocks}
      saving={saving}
      onChange={setBlocks}
      onPersist={onSave}
    />
  );
}
