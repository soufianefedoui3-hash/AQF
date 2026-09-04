"use client";

export function CanvasGuard({ children }: { children: React.ReactNode }) {
  function handleClickCapture(event: React.MouseEvent<HTMLDivElement>) {
    const target = event.target as HTMLElement | null;
    if (!target) return;
    if (target.closest("[data-builder-chrome]")) return;

    const interactive = target.closest("a[href], button, [role='link']");
    if (!interactive) return;

    // Stop navigation / submit, but let the click bubble so the block can be selected.
    event.preventDefault();
  }

  return (
    <div
      className="min-h-full"
      data-builder-canvas
      onClickCapture={handleClickCapture}
    >
      {children}
    </div>
  );
}
