"use client";

import { useEffect, useState } from "react";
import { ExternalLink, Trash2 } from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

export type PreviewNavLink = { id?: string; href: string; label: string };

export function VisualPageFrame({
  title,
  href,
  subtitle,
  navLinks,
  activeHref,
  showInNav,
  saving,
  onRename,
  onToggleNav,
  onDelete,
  onSelectNav,
  children,
}: {
  title: string;
  href?: string;
  subtitle?: string;
  navLinks: PreviewNavLink[];
  activeHref?: string;
  showInNav?: boolean;
  saving: boolean;
  onRename?: (title: string) => Promise<void> | void;
  onToggleNav?: (show: boolean) => Promise<void> | void;
  onDelete?: () => void;
  onSelectNav?: (link: PreviewNavLink) => void;
  children: React.ReactNode;
}) {
  const [draft, setDraft] = useState(title);
  const [editingTitle, setEditingTitle] = useState(false);

  useEffect(() => {
    setDraft(title);
  }, [title]);

  async function commitTitle() {
    const next = draft.trim() || title;
    setDraft(next);
    setEditingTitle(false);
    if (next !== title) await onRename?.(next);
  }

  return (
    <div className="overflow-hidden rounded-3xl border border-primary-100 bg-white shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-primary-50 bg-accent-50/60 px-4 py-3 sm:px-5">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent-700">
            Aperçu live
          </p>
          <p className="text-sm text-text-muted">
            Même mise en page que le site public. Survolez un bloc pour le modifier.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {typeof showInNav === "boolean" && onToggleNav ? (
            <label className="flex items-center gap-2 text-xs text-primary-900">
              <input
                type="checkbox"
                checked={showInNav}
                disabled={saving}
                onChange={(e) => onToggleNav(e.target.checked)}
                className="h-4 w-4 rounded border-primary-200"
              />
              Menu du site
            </label>
          ) : null}
          {href ? (
            <a
              href={href}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-xs font-medium text-accent-700 hover:underline"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              Voir la page
            </a>
          ) : null}
          {onDelete ? (
            <Button type="button" variant="danger" size="sm" loading={saving} onClick={onDelete}>
              <Trash2 className="h-4 w-4" />
              Supprimer cette page
            </Button>
          ) : null}
        </div>
      </div>

      <header className="border-b border-primary-100 bg-white/95">
        <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
          <Logo variant="navbar" />
          <div className="hidden min-w-0 flex-1 items-center justify-center gap-1 md:flex">
            {navLinks.map((link) => {
              const active = Boolean(activeHref && link.href === activeHref);
              return (
                <button
                  key={`${link.href}-${link.label}`}
                  type="button"
                  onClick={() => onSelectNav?.(link)}
                  className={cn(
                    "rounded-lg px-3 py-2 text-sm font-medium transition",
                    active
                      ? "bg-accent-50 text-primary-900 ring-1 ring-accent-200"
                      : "text-text-muted hover:bg-accent-50 hover:text-primary-900"
                  )}
                >
                  {link.label}
                </button>
              );
            })}
          </div>
          <span className="hidden rounded-xl bg-cta-gradient px-4 py-2 text-sm font-semibold text-primary-900 shadow-sm sm:inline">
            Demander une consultation
          </span>
        </nav>
      </header>

      <section className="relative overflow-hidden bg-brand-gradient pb-12 pt-10 md:pb-14 md:pt-12">
        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {editingTitle && onRename ? (
            <input
              autoFocus
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onBlur={() => void commitTitle()}
              onKeyDown={(e) => {
                if (e.key === "Enter") void commitTitle();
                if (e.key === "Escape") {
                  setDraft(title);
                  setEditingTitle(false);
                }
              }}
              className="w-full bg-transparent text-3xl font-bold tracking-tight text-white outline-none ring-2 ring-white/40 sm:text-4xl"
            />
          ) : (
            <button
              type="button"
              disabled={!onRename || saving}
              onClick={() => onRename && setEditingTitle(true)}
              className="text-left text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl"
              title="Cliquer pour renommer"
            >
              {title}
            </button>
          )}
          {subtitle ? (
            <p className="mt-4 max-w-2xl text-lg text-primary-100">{subtitle}</p>
          ) : (
            <p className="mt-3 text-sm text-primary-100/80">
              Cliquez sur le titre pour le renommer. Le menu public se met à jour automatiquement.
            </p>
          )}
        </div>
      </section>

      {children}
    </div>
  );
}
