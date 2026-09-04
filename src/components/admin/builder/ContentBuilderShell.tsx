"use client";

import { ExternalLink, Plus, Trash2 } from "lucide-react";
import { BuilderInspector } from "@/components/admin/builder/BuilderInspector";
import { useBuilder } from "@/components/admin/builder/BuilderContext";
import { Button } from "@/components/ui/Button";

export type BuilderPageItem = {
  id: string;
  label: string;
  showInNav?: boolean;
};

export function ContentBuilderShell({
  pages,
  activeId,
  saving,
  pageHref,
  showInNav,
  onSelectPage,
  onCreatePage,
  onDeletePage,
  onToggleNav,
  children,
}: {
  pages: BuilderPageItem[];
  activeId: string;
  saving?: boolean;
  pageHref?: string;
  showInNav?: boolean;
  onSelectPage: (id: string) => void;
  onCreatePage: () => void;
  onDeletePage?: () => void;
  onToggleNav?: (show: boolean) => void;
  children: React.ReactNode;
}) {
  const builder = useBuilder();
  const savedAt = builder?.savedAt;

  return (
    <div className="flex h-full min-h-0 bg-[#e8eef0]">
      <aside
        data-builder-panel
        className="flex h-full w-[20.5rem] shrink-0 flex-col border-r border-primary-100 bg-white"
      >
        <div className="border-b border-primary-50 px-4 py-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-accent-700">
            Constructeur visuel
          </p>
          <h2 className="text-lg font-semibold text-primary-900">Pages du site</h2>
          {savedAt ? (
            <p className="mt-1 text-xs text-secondary-700">Enregistré automatiquement</p>
          ) : (
            <p className="mt-1 text-xs text-text-muted">Cliquez un bloc pour l&apos;éditer.</p>
          )}
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-3 py-3">
          <div className="space-y-1">
            {pages.map((page) => {
              const active = page.id === activeId;
              return (
                <button
                  key={page.id}
                  type="button"
                  onClick={() => {
                    builder?.clear();
                    onSelectPage(page.id);
                  }}
                  className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-sm transition ${
                    active
                      ? "bg-primary-900 text-white shadow-sm"
                      : "text-primary-800 hover:bg-accent-50"
                  }`}
                >
                  <span className="truncate font-medium">{page.label}</span>
                </button>
              );
            })}
          </div>
          <button
            type="button"
            onClick={onCreatePage}
            className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-xl border border-dashed border-accent-400 bg-accent-50 px-3 py-2.5 text-sm font-medium text-primary-800 hover:bg-accent-100"
          >
            <Plus className="h-4 w-4" />
            Nouvelle page
          </button>

          <div className="mt-4 space-y-2 rounded-2xl border border-primary-50 bg-surface-muted/50 p-3">
            {typeof showInNav === "boolean" && onToggleNav ? (
              <label className="flex items-center gap-2 text-xs text-primary-900">
                <input
                  type="checkbox"
                  checked={showInNav}
                  disabled={saving}
                  onChange={(e) => onToggleNav(e.target.checked)}
                  className="h-4 w-4 rounded border-primary-200"
                />
                Afficher dans le menu
              </label>
            ) : null}
            {pageHref ? (
              <a
                href={pageHref}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-xs font-medium text-accent-700 hover:underline"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                Voir la page publique
              </a>
            ) : null}
            {onDeletePage ? (
              <Button type="button" variant="danger" size="sm" loading={saving} onClick={onDeletePage}>
                <Trash2 className="h-4 w-4" />
                Supprimer la page
              </Button>
            ) : null}
          </div>
        </div>

        <div className="min-h-0 flex-[1.15] overflow-y-auto border-t border-primary-100 px-4 py-4">
          <BuilderInspector saving={saving} />
        </div>
      </aside>

      <div className="min-h-0 min-w-0 flex-1 overflow-y-auto">
        {children}
      </div>
    </div>
  );
}
