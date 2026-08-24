import { Card } from "./Section";

interface EmptyStateProps {
  title: string;
  /** Why there is no data. Be specific — never imply the user has no music. */
  reason: string;
  /** What would make it work again. */
  next?: string;
}

/**
 * Honest empty state for sections whose data source disappeared upstream.
 *
 * Spotify removed artist `genres` in Aug 2026, so the genre/mood sections have
 * nothing to render until Last.fm enrichment lands. Rendering an empty chart
 * would read as "you have no genres"; this says what actually happened.
 */
export function EmptyState({ title, reason, next }: EmptyStateProps) {
  return (
    <Card className="flex flex-col items-center gap-3 px-6 py-10 text-center">
      <div
        aria-hidden
        className="flex h-10 w-10 items-center justify-center rounded-full bg-accent-soft"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          className="h-5 w-5 text-accent"
        >
          <path d="M12 8v5" />
          <circle cx="12" cy="16.5" r="0.6" fill="currentColor" stroke="none" />
          <circle cx="12" cy="12" r="9" />
        </svg>
      </div>
      <p className="text-sm font-semibold text-ink">{title}</p>
      <p className="max-w-md text-sm leading-relaxed text-muted">{reason}</p>
      {next && (
        <p className="max-w-md text-xs leading-relaxed text-faint">{next}</p>
      )}
    </Card>
  );
}

/** The specific case that now affects three sections. */
export function GenresUnavailable({ title }: { title: string }) {
  return (
    <EmptyState
      title={title}
      reason="Spotify stopped returning artist genres in August 2026, so there's nothing to classify. This isn't a gap in your listening history."
      next="Comes back once Last.fm tag enrichment is wired up."
    />
  );
}
