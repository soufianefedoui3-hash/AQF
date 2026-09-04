import type { ReactNode } from "react";
import { ChevronDown } from "lucide-react";
import type { FaqItem } from "@/lib/page-blocks";

export function FaqAccordion({
  items,
  wrapItem,
}: {
  items: FaqItem[];
  wrapItem?: (item: FaqItem, index: number, node: ReactNode) => ReactNode;
}) {
  return (
    <div className="space-y-3">
      {items.map((item, index) => {
        const row = (
          <details
            className="group overflow-hidden rounded-2xl border border-primary-100 bg-white shadow-sm"
            open={index === 0}
          >
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 text-left font-semibold text-primary-900 [&::-webkit-details-marker]:hidden">
              <span>{item.question.trim() || "Question"}</span>
              <ChevronDown className="h-5 w-5 shrink-0 text-accent-600 transition group-open:rotate-180" />
            </summary>
            {item.answer.trim() ? (
              <p className="whitespace-pre-line border-t border-primary-50 px-5 py-4 text-sm leading-relaxed text-text-muted">
                {item.answer.trim()}
              </p>
            ) : null}
          </details>
        );
        return (
          <div key={`${item.question}-${index}`}>
            {wrapItem ? wrapItem(item, index, row) : row}
          </div>
        );
      })}
    </div>
  );
}
