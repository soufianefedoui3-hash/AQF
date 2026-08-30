import type { ReactNode } from "react";
import { HOMEPAGE_STATS } from "@/lib/constants";

export type HomepageStatItem = { value: string; label: string };

export function HomepageStats({
  stats = HOMEPAGE_STATS,
  wrapStat,
}: {
  stats?: readonly HomepageStatItem[];
  wrapStat?: (stat: HomepageStatItem, index: number, node: ReactNode) => ReactNode;
}) {
  const visible = stats.filter((stat) => stat.value.trim() || stat.label.trim());
  if (visible.length === 0) return null;

  return (
    <section className="bg-surface-muted py-14 md:py-16">
      <div className="mx-auto grid max-w-5xl grid-cols-2 gap-4 px-4 sm:grid-cols-4 sm:gap-6 sm:px-6">
        {visible.map((stat, index) => {
          const card = (
            <div className="rounded-2xl border border-primary-100 bg-white p-5 text-center shadow-sm sm:p-6">
              <p className="text-2xl font-bold text-primary-900 sm:text-3xl">{stat.value}</p>
              <p className="mt-1 text-xs text-text-muted sm:text-sm">{stat.label}</p>
            </div>
          );
          return (
            <div key={`${stat.label}-${index}`}>
              {wrapStat ? wrapStat(stat, index, card) : card}
            </div>
          );
        })}
      </div>
    </section>
  );
}
