"use client";

import { createContext, useCallback, useContext, useMemo, useRef, useState } from "react";
import type { EditField } from "@/components/admin/BlockEditModal";
import type { PageBlock } from "@/lib/page-blocks";

export type BuilderSelection = {
  id: string;
  label: string;
  fields?: EditField[];
  values?: Record<string, string>;
  block?: PageBlock;
  onValuesChange?: (values: Record<string, string>) => void;
  onBlockChange?: (block: PageBlock) => void;
  onPersist?: (values?: Record<string, string>) => Promise<unknown> | void;
  onDuplicate?: () => Promise<unknown> | void;
  onDelete?: () => Promise<unknown> | void;
};

export type DuplicateRegionPayload = {
  label: string;
  values: Record<string, string>;
};

type BuilderContextValue = {
  selected: BuilderSelection | null;
  select: (selection: BuilderSelection) => void;
  clear: () => void;
  editorOpen: boolean;
  openEditor: (selection?: BuilderSelection) => void;
  closeEditor: () => void;
  patchValues: (values: Record<string, string>) => void;
  patchBlock: (block: PageBlock) => void;
  insertAt: number | null;
  setInsertAt: (index: number | null) => void;
  savedAt: number | null;
  markSaved: () => void;
  duplicateRegion: (payload: DuplicateRegionPayload) => Promise<void>;
};

const BuilderContext = createContext<BuilderContextValue | null>(null);

export function BuilderProvider({
  children,
  onDuplicateRegion,
}: {
  children: React.ReactNode;
  onDuplicateRegion?: (payload: DuplicateRegionPayload) => Promise<void> | void;
}) {
  const [selected, setSelected] = useState<BuilderSelection | null>(null);
  const [editorOpen, setEditorOpen] = useState(false);
  const [insertAt, setInsertAt] = useState<number | null>(null);
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const selectedRef = useRef(selected);
  selectedRef.current = selected;
  const duplicateRef = useRef(onDuplicateRegion);
  duplicateRef.current = onDuplicateRegion;

  const select = useCallback((selection: BuilderSelection) => {
    setSelected(selection);
  }, []);

  const clear = useCallback(() => {
    setSelected(null);
    setEditorOpen(false);
  }, []);

  const openEditor = useCallback((selection?: BuilderSelection) => {
    if (selection) setSelected(selection);
    setEditorOpen(true);
  }, []);

  const closeEditor = useCallback(() => setEditorOpen(false), []);

  const patchValues = useCallback((values: Record<string, string>) => {
    setSelected((prev) => {
      if (!prev) return prev;
      prev.onValuesChange?.(values);
      return { ...prev, values };
    });
  }, []);

  const patchBlock = useCallback((block: PageBlock) => {
    setSelected((prev) => {
      if (!prev) return prev;
      prev.onBlockChange?.(block);
      return { ...prev, block };
    });
  }, []);

  const duplicateRegion = useCallback(async (payload: DuplicateRegionPayload) => {
    await duplicateRef.current?.(payload);
  }, []);

  const value = useMemo(
    () => ({
      selected,
      select,
      clear,
      editorOpen,
      openEditor,
      closeEditor,
      patchValues,
      patchBlock,
      insertAt,
      setInsertAt,
      savedAt,
      markSaved: () => setSavedAt(Date.now()),
      duplicateRegion,
    }),
    [
      selected,
      select,
      clear,
      editorOpen,
      openEditor,
      closeEditor,
      patchValues,
      patchBlock,
      insertAt,
      savedAt,
      duplicateRegion,
    ]
  );

  return <BuilderContext.Provider value={value}>{children}</BuilderContext.Provider>;
}

export function useBuilder(): BuilderContextValue | null {
  return useContext(BuilderContext);
}

export function useRequiredBuilder(): BuilderContextValue {
  const value = useContext(BuilderContext);
  if (!value) throw new Error("BuilderProvider is required");
  return value;
}
