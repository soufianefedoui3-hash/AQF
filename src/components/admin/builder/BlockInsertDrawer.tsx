"use client";

import {
  AlignLeft,
  BarChart3,
  Columns3,
  Heading,
  HelpCircle,
  LayoutGrid,
  Link2,
  List,
  MessageSquareQuote,
  Minus,
  Plus,
  Square,
  TriangleAlert,
  Video,
} from "lucide-react";
import { PAGE_BLOCK_TYPES, type PageBlockType } from "@/lib/page-blocks";

const BLOCK_CATALOG: Array<{
  type: PageBlockType;
  title: string;
  hint: string;
  icon: typeof Heading;
}> = [
  { type: "heading", title: "Titre", hint: "Heading + sous-texte", icon: Heading },
  { type: "paragraph", title: "Paragraphe", hint: "Bloc de texte", icon: AlignLeft },
  { type: "card", title: "Carte en vedette", hint: "Highlight card", icon: Square },
  { type: "list", title: "Liste à puces", hint: "Points clés", icon: List },
  { type: "cta", title: "Bouton CTA", hint: "Lien d'action", icon: Link2 },
  { type: "alert", title: "Alerte", hint: "Notification", icon: TriangleAlert },
  { type: "quote", title: "Témoignage", hint: "Citation client", icon: MessageSquareQuote },
  { type: "grid", title: "Grille", hint: "2 ou 3 colonnes", icon: Columns3 },
  { type: "faq", title: "FAQ", hint: "Questions / réponses", icon: HelpCircle },
  { type: "divider", title: "Séparateur", hint: "Ligne visuelle", icon: Minus },
  { type: "video", title: "Vidéo", hint: "Embed URL", icon: Video },
  { type: "stats", title: "Compteurs", hint: "Statistiques", icon: BarChart3 },
];

export function BlockInsertDrawer({
  open,
  onClose,
  onPick,
}: {
  open: boolean;
  onClose: () => void;
  onPick: (type: PageBlockType) => void;
}) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[90] flex items-end justify-center bg-primary-900/50 p-4 sm:items-center"
      onClick={onClose}
    >
      <div
        data-builder-chrome
        className="max-h-[86vh] w-full max-w-3xl overflow-y-auto rounded-3xl border border-primary-100 bg-white p-5 shadow-2xl sm:p-6"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-labelledby="add-block-title"
      >
        <div className="mb-5 flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-accent-700">
              Bibliothèque
            </p>
            <h2 id="add-block-title" className="text-xl font-semibold text-primary-900">
              Ajouter un bloc
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-3 py-1.5 text-sm text-text-muted hover:bg-primary-50 hover:text-primary-900"
          >
            Fermer
          </button>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {BLOCK_CATALOG.filter((item) =>
            PAGE_BLOCK_TYPES.includes(item.type)
          ).map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.type}
                type="button"
                onClick={() => onPick(item.type)}
                className="flex items-start gap-3 rounded-2xl border border-primary-100 bg-surface-muted/40 p-4 text-left transition hover:border-accent-300 hover:bg-accent-50"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-primary-800 shadow-sm">
                  <Icon className="h-5 w-5" />
                </span>
                <span>
                  <span className="flex items-center gap-1 font-semibold text-primary-900">
                    <Plus className="h-3.5 w-3.5 text-accent-600" />
                    {item.title}
                  </span>
                  <span className="mt-0.5 block text-xs text-text-muted">{item.hint}</span>
                </span>
              </button>
            );
          })}
          <div className="flex items-start gap-3 rounded-2xl border border-dashed border-primary-200 p-4 text-left">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-primary-500">
              <LayoutGrid className="h-5 w-5" />
            </span>
            <span>
              <span className="font-semibold text-primary-900">Section personnalisée</span>
              <span className="mt-0.5 block text-xs text-text-muted">
                Utilisez « Ajouter une section » pour un bloc titre + texte libre.
              </span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
