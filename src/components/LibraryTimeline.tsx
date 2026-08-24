import type { MonthBucket } from "@/types/spotify";
import { formatMonth } from "@/lib/utils";
import { Card } from "./Section";

interface LibraryTimelineProps {
  months: MonthBucket[];
  total: number;
}

/**
 * Library growth over time, from `added_at` on saved tracks.
 *
 * This is the only genuine time-series left in the API — every other endpoint
 * returns a ranked snapshot with no timestamps. The endpoint existed but was
 * never called by the frontend.
 */
export function LibraryTimeline({ months, total }: LibraryTimelineProps) {
  if (months.length === 0) return null;

  const max = Math.max(...months.map((m) => m.count));
  const busiest = months.reduce((a, b) => (b.count > a.count ? b : a));

  return (
    <Card>
      <div className="mb-5 flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
        <p className="text-sm text-muted">
          Most recent{" "}
          <span className="font-semibold text-ink tabular">
            {months.reduce((sum, m) => sum + m.count, 0)}
          </span>{" "}
          saves, by month
        </p>
        <p className="text-sm text-muted">
          Busiest:{" "}
          <span className="font-semibold text-ink">
            {formatMonth(busiest.month)}
          </span>{" "}
          <span className="tabular">({busiest.count})</span>
        </p>
      </div>

      <div className="flex items-end gap-1.5 overflow-x-auto pb-1">
        {months.map((m, i) => {
          const heightPct = Math.max((m.count / max) * 100, 4);
          return (
            <div
              key={m.month}
              className="group flex min-w-[36px] flex-1 flex-col items-center gap-2"
            >
              <div className="relative flex h-28 w-full items-end">
                <div
                  className="grow-x w-full rounded-t-[4px] bg-accent-2 transition-colors group-hover:bg-accent"
                  style={{
                    height: `${heightPct}%`,
                    animationDelay: `${i * 40}ms`,
                  }}
                />
                <span className="pointer-events-none absolute -top-1 left-1/2 -translate-x-1/2 rounded bg-ink px-1.5 py-0.5 text-[10px] font-medium text-bg opacity-0 transition-opacity group-hover:opacity-100 tabular">
                  {m.count}
                </span>
              </div>
              <span className="whitespace-nowrap text-[10px] text-faint">
                {formatMonth(m.month)}
              </span>
            </div>
          );
        })}
      </div>

      <p className="mt-4 border-t border-border pt-3 text-xs text-faint">
        {total.toLocaleString()} tracks saved all-time · chart covers the 50 most
        recently added
      </p>
    </Card>
  );
}
