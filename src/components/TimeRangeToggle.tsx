"use client";

import { TIME_RANGES, type TimeRange } from "@/types/spotify";
import { cx } from "@/lib/utils";

interface TimeRangeToggleProps {
  value: TimeRange;
  onChange: (range: TimeRange) => void;
  busy?: boolean;
}

/**
 * The dashboard's main control. Spotify serves top artists/tracks for three
 * windows; the app previously hardcoded medium_term and never exposed the
 * other two — which undercut the whole "check my stats any day" premise.
 */
export function TimeRangeToggle({
  value,
  onChange,
  busy,
}: TimeRangeToggleProps) {
  return (
    <div
      role="tablist"
      aria-label="Time range"
      className="inline-flex items-center gap-1 rounded-full border border-border bg-surface p-1"
    >
      {TIME_RANGES.map((range) => {
        const active = range.value === value;
        return (
          <button
            key={range.value}
            role="tab"
            aria-selected={active}
            onClick={() => onChange(range.value)}
            className={cx(
              "relative rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors",
              active
                ? "bg-accent text-on-accent shadow-[var(--shadow-sm)]"
                : "text-muted hover:bg-surface-hover hover:text-ink"
            )}
          >
            {range.short}
            {active && busy && (
              <span
                aria-hidden
                className="ml-2 inline-block h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent align-[-2px]"
              />
            )}
          </button>
        );
      })}
      <span className="sr-only" aria-live="polite">
        {busy ? "Updating stats" : ""}
      </span>
    </div>
  );
}
