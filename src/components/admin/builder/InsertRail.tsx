"use client";

import { Plus } from "lucide-react";

export function InsertRail({
  onAdd,
  disabled,
}: {
  onAdd: () => void;
  disabled?: boolean;
}) {
  return (
    <div className="group/rail relative z-20 h-0">
      <div className="absolute inset-x-0 top-1/2 flex -translate-y-1/2 items-center justify-center">
        <div className="h-px w-full bg-transparent transition group-hover/rail:bg-accent-300" />
        <button
          type="button"
          data-builder-chrome
          disabled={disabled}
          title="Ajouter un bloc"
          aria-label="Ajouter un bloc"
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();
            onAdd();
          }}
          className="absolute inline-flex h-7 w-7 items-center justify-center rounded-full bg-accent-500 text-white opacity-0 shadow-md transition hover:bg-accent-600 group-hover/rail:opacity-100 disabled:opacity-40"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
