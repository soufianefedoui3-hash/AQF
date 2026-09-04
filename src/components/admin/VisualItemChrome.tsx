"use client";

import { Copy, Pencil, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

export function VisualItemChrome({
  label,
  editing,
  disabled,
  children,
  onSelect,
  onEdit,
  onDuplicate,
  onDelete,
  fit = "card",
}: {
  label: string;
  editing?: boolean;
  disabled?: boolean;
  children: React.ReactNode;
  onSelect?: () => void;
  onEdit?: () => void;
  onDone?: () => void;
  onDuplicate?: () => void;
  onDelete?: () => void;
  fit?: "card" | "section";
}) {
  return (
    <div
      className={cn(
        "group/chrome relative isolate",
        fit === "card" && "flex h-full min-h-0 flex-col",
        editing && "z-20"
      )}
      onClick={(event) => {
        if ((event.target as HTMLElement).closest("[data-builder-chrome]")) return;
        onSelect?.();
      }}
    >
      <div
        data-builder-chrome
        className={cn(
          "pointer-events-auto absolute right-2 top-2 z-50 flex max-w-[calc(100%-1rem)] flex-wrap justify-end gap-1",
          editing
            ? "opacity-100"
            : "opacity-0 group-hover/chrome:opacity-100 group-focus-within/chrome:opacity-100"
        )}
      >
        <span className="hidden rounded-full bg-white/95 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-primary-500 shadow-sm sm:inline">
          {label}
        </span>
        <ToolbarButton onClick={() => onEdit?.()}>
          <Pencil className="h-3.5 w-3.5" />
          Modifier
        </ToolbarButton>
        <ToolbarButton onClick={() => onDuplicate?.()}>
          <Copy className="h-3.5 w-3.5" />
          Dupliquer
        </ToolbarButton>
        <ToolbarButton danger onClick={() => onDelete?.()}>
          <Trash2 className="h-3.5 w-3.5" />
          Supprimer
        </ToolbarButton>
      </div>
      <div
        className={cn(
          "min-h-0",
          fit === "card" && "h-full rounded-2xl [&>*]:h-full",
          fit === "card" &&
            (editing
              ? "ring-2 ring-accent-400 ring-offset-2 ring-offset-white"
              : "group-hover/chrome:ring-1 group-hover/chrome:ring-accent-300")
        )}
      >
        {children}
      </div>
    </div>
  );
}

function ToolbarButton({
  children,
  onClick,
  disabled,
  danger,
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      data-builder-chrome
      disabled={disabled}
      onMouseDown={(event) => {
        event.preventDefault();
        event.stopPropagation();
      }}
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
        onClick();
      }}
      className={cn(
        "inline-flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-semibold shadow-sm backdrop-blur",
        "disabled:cursor-not-allowed disabled:opacity-50",
        danger
          ? "bg-red-600 text-white hover:bg-red-700"
          : "bg-white/95 text-primary-800 ring-1 ring-primary-100 hover:bg-accent-50"
      )}
    >
      {children}
    </button>
  );
}
