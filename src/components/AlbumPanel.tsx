"use client";

import Image from "next/image";
import type { TopTrack } from "@/types/spotify";
import { cx } from "@/lib/utils";
import { TRACK_LIST_ROWS, TRACK_ROW_HEIGHT } from "./TrackList";

/** Matches the top-tracks list beside it, so the two columns line up exactly. */
const PANEL_HEIGHT = TRACK_LIST_ROWS * TRACK_ROW_HEIGHT;

/**
 * Skeleton for the album explorer panel.
 *
 * Real today: cover art, track name, artist, and album name — all of which the
 * clicked TopTrack already carries, so no new request is needed.
 *
 * Placeholder today: the album's own track list and the top-50 rank badges on
 * it. Both need a `/api/album/<id>` route that does not exist yet, so the list
 * renders shimmer rows and the panel says so plainly rather than pretending to
 * be empty.
 */

interface AlbumPanelProps {
  track: TopTrack | null;
  /** Rank of `track` in the current top-tracks list, 1-based. */
  rank?: number;
  /** Step to the previous/next song in the top-tracks list. */
  onPrev?: () => void;
  onNext?: () => void;
  hasPrev?: boolean;
  hasNext?: boolean;
}

function StepButton({
  direction,
  onClick,
  disabled,
}: {
  direction: "prev" | "next";
  onClick?: () => void;
  disabled?: boolean;
}) {
  const label = direction === "prev" ? "Previous track" : "Next track";
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      className={cx(
        "flex h-10 w-10 items-center justify-center rounded-full border border-border",
        "text-ink transition-colors",
        disabled
          ? "cursor-not-allowed text-faint"
          : "hover:border-border-strong hover:bg-surface-hover"
      )}
    >
      <svg
        aria-hidden
        viewBox="0 0 24 24"
        fill="currentColor"
        className={cx("h-4 w-4", direction === "next" && "rotate-180")}
      >
        <path d="M15.5 4.5v15L5 12z" />
      </svg>
    </button>
  );
}

/** One shimmer row standing in for an album track we can't fetch yet. */
function SkeletonRow({ width }: { width: string }) {
  return (
    <div className="flex items-center gap-3 border-b border-border px-4 py-2.5 last:border-b-0">
      <span className="w-4 shrink-0 font-mono text-xs text-faint tabular">
        &nbsp;
      </span>
      <div className="min-w-0 flex-1">
        <div
          className="h-3 animate-pulse rounded-full bg-surface-sunken"
          style={{ width }}
        />
      </div>
    </div>
  );
}

/**
 * Rank badge for an album track that also charts in the user's top 50.
 * `inferred` marks a name+artist fallback match — the album's release differs
 * from the one in the top-tracks list, so the rank is a best guess and must
 * say so rather than read as exact.
 */
export function RankBadge({
  rank,
  inferred = false,
}: {
  rank: number;
  inferred?: boolean;
}) {
  return (
    <span
      title={
        inferred
          ? "Matched by title — this release differs from the one in your top tracks"
          : `#${rank} in your top tracks`
      }
      className={cx(
        "shrink-0 rounded-full px-2 py-0.5 font-mono text-[11px] font-semibold tabular",
        inferred
          ? "border border-dashed border-accent-2 text-accent"
          : "bg-accent text-on-accent"
      )}
    >
      {inferred ? "~" : ""}#{rank}
    </span>
  );
}

function EmptyPanel() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-3 px-6 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-surface-sunken">
        <svg
          aria-hidden
          viewBox="0 0 24 24"
          fill="currentColor"
          className="h-6 w-6 text-faint"
        >
          <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
        </svg>
      </div>
      <p className="text-sm font-medium text-ink">Pick a track</p>
      <p className="max-w-[15rem] text-xs text-muted">
        Choose a song from your top tracks to see its album and how the rest of
        it ranks for you.
      </p>
    </div>
  );
}

export function AlbumPanel({
  track,
  rank,
  onPrev,
  onNext,
  hasPrev = false,
  hasNext = false,
}: AlbumPanelProps) {
  return (
    <div
      className="flex flex-col overflow-hidden rounded-[var(--radius-lg)] border border-border bg-surface"
      style={{ height: PANEL_HEIGHT }}
    >
      {!track ? (
        <EmptyPanel />
      ) : (
        <>
          <div className="flex shrink-0 flex-col items-center gap-4 px-5 pb-4 pt-5">
            <div className="relative aspect-square w-full max-w-[13rem] overflow-hidden rounded-[var(--radius-md)] bg-surface-sunken shadow-[var(--shadow-md)]">
              {track.image ? (
                <Image
                  src={track.image}
                  alt={track.album ?? track.name}
                  fill
                  sizes="208px"
                  className="object-cover"
                />
              ) : null}
            </div>

            <div className="w-full text-center">
              <div className="flex items-center justify-center gap-2">
                {rank !== undefined && <RankBadge rank={rank} />}
                <p className="truncate text-sm font-semibold text-ink">
                  {track.name}
                </p>
              </div>
              <p className="mt-1 truncate text-xs text-muted">{track.artist}</p>
              {track.album && (
                <p className="mt-0.5 truncate text-xs text-faint">
                  {track.album}
                  {track.release_date && ` · ${track.release_date.slice(0, 4)}`}
                </p>
              )}
            </div>

            <div className="flex items-center gap-4">
              <StepButton
                direction="prev"
                onClick={onPrev}
                disabled={!hasPrev}
              />
              <StepButton
                direction="next"
                onClick={onNext}
                disabled={!hasNext}
              />
            </div>
          </div>

          {/* Everything below is the not-yet-wired half. It absorbs whatever
              height is left over so the panel stays flush with the list. */}
          <div className="flex min-h-0 flex-1 flex-col border-t border-border">
            <div className="flex shrink-0 items-center justify-between px-4 py-2.5">
              <p className="text-xs font-medium text-muted">Album tracks</p>
              <p className="font-mono text-[11px] text-faint">soon</p>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto border-t border-border">
              <SkeletonRow width="72%" />
              <SkeletonRow width="55%" />
              <SkeletonRow width="64%" />
              <SkeletonRow width="48%" />
            </div>
            <p className="shrink-0 px-4 py-3 text-[11px] leading-relaxed text-faint">
              The album&apos;s full track list, with a rank badge on every song
              that charts in your top 50, lands once the album endpoint is
              wired up.
            </p>
          </div>
        </>
      )}
    </div>
  );
}
