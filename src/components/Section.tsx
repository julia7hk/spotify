import type { ReactNode } from "react";
import { cx } from "@/lib/utils";

interface SectionProps {
  title: string;
  subtitle?: string;
  /** Rendered at the right of the header row — counts, links, controls. */
  aside?: ReactNode;
  children: ReactNode;
  className?: string;
}

/**
 * One consistent section header for the whole dashboard. Previously every
 * component hand-rolled its own `<h2 className="text-2xl font-bold mb-6">`,
 * with subtitles sometimes present and sometimes not.
 */
export function Section({
  title,
  subtitle,
  aside,
  children,
  className,
}: SectionProps) {
  return (
    <section className={cx("mb-12", className)}>
      <div className="mb-5 flex items-end justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-ink">{title}</h2>
          {subtitle && (
            <p className="mt-1 text-sm text-muted">{subtitle}</p>
          )}
        </div>
        {aside && <div className="shrink-0">{aside}</div>}
      </div>
      {children}
    </section>
  );
}

/** Flat card surface used by every panel, so radius/border stay consistent. */
export function Card({
  children,
  className,
  padded = true,
}: {
  children: ReactNode;
  className?: string;
  padded?: boolean;
}) {
  return (
    <div
      className={cx(
        "rounded-[var(--radius-lg)] border border-border bg-surface",
        padded && "p-5",
        className
      )}
    >
      {children}
    </div>
  );
}
