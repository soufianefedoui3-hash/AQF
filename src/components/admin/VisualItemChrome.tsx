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
}) {
  return (
    <div
      className={cn("group/chrome relative", editing && "z-10")}
      onClick={(event) => {
        if ((event.target as HTMLElement).closest("[data-builder-chrome]")) return;
        onSelect?.();
      }}
    >
      <div
        className={cn(
          "pointer-events-none absolute inset-1 z-10 rounded-2xl ring-2 ring-inset transition",
          editing
            ? "ring-accent-400 shadow-[0_0_0_4px_rgba(45,212,191,0.18)]"
            : "ring-transparent group-hover/chrome:ring-accent-300"
        )}
      />
      <div
        data-builder-chrome
        className={cn(
          "absolute right-3 top-3 z-20 flex flex-wrap justify-end gap-1 transition",
          editing
            ? "opacity-100"
            : "opacity-0 group-hover/chrome:opacity-100 group-focus-within/chrome:opacity-100"
        )}
      >
        <span className="hidden rounded-full bg-white/95 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-primary-500 shadow-sm sm:inline">
          {label}
        </span>
        {onEdit ? (
          <ToolbarButton disabled={disabled} onClick={onEdit}>
            <Pencil className="h-3.5 w-3.5" />
            Modifier
          </ToolbarButton>
        ) : null}
        {onDuplicate ? (
          <ToolbarButton disabled={disabled} onClick={onDuplicate}>
            <Copy className="h-3.5 w-3.5" />
            Dupliquer
          </ToolbarButton>
        ) : null}
        {onDelete ? (
          <ToolbarButton danger disabled={disabled} onClick={onDelete}>
            <Trash2 className="h-3.5 w-3.5" />
            Supprimer
          </ToolbarButton>
        ) : null}
      </div>
      {children}
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
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
        onClick();
      }}
      className={cn(
        "inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-semibold shadow-sm backdrop-blur",
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
