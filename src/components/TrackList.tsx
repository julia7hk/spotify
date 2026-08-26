import Image from "next/image";
import type { TopTrack, RecentTrack, SavedTrack } from "@/types/spotify";
import { getRelativeTime, cx } from "@/lib/utils";

type AnyTrack = TopTrack | RecentTrack | SavedTrack;

function AlbumArt({
  src,
  alt,
  size = 40,
}: {
  src: string | null;
  alt: string;
  size?: number;
}) {
  if (src) {
    return (
      <Image
        src={src}
        alt=""
        width={size}
        height={size}
        className="rounded-[6px] object-cover"
        style={{ width: size, height: size }}
      />
    );
  }
  return (
    <div
      className="flex items-center justify-center rounded-[6px] bg-surface-sunken"
      style={{ width: size, height: size }}
      aria-label={alt}
    >
      <svg
        className="h-4 w-4 text-faint"
        fill="currentColor"
        viewBox="0 0 24 24"
        aria-hidden
      >
        <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
      </svg>
    </div>
  );
}

interface TrackItemProps {
  track: AnyTrack;
  rank?: number;
  /** Right-hand metadata: a relative timestamp or the album name. */
  meta?: string | null;
  /**
   * When supplied, the row selects the track instead of navigating to Spotify,
   * and the external link moves onto the arrow icon alone.
   */
  onSelect?: () => void;
  selected?: boolean;
}

/** The external-link arrow, shown on row hover. */
function OpenIcon({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cx("h-3.5 w-3.5 shrink-0", className)}
    >
      <path d="M7 17 17 7M9 7h8v8" />
    </svg>
  );
}

function TrackItem({ track, rank, meta, onSelect, selected }: TrackItemProps) {
  const body = (
    <>
      {rank !== undefined && (
        <span
          className={cx(
            "w-5 shrink-0 text-right font-mono text-xs tabular",
            selected ? "text-accent" : "text-faint"
          )}
        >
          {rank}
        </span>
      )}
      <AlbumArt src={track.image} alt={track.album ?? track.name} />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-ink">{track.name}</p>
        <p className="truncate text-xs text-muted">{track.artist}</p>
      </div>
      {meta && (
        <p className="hidden shrink-0 whitespace-nowrap text-xs text-faint sm:block">
          {meta}
        </p>
      )}
    </>
  );

  const rowClass =
    "group flex items-center gap-3 border-b border-border px-4 py-2.5 transition-colors last:border-b-0";

  // Non-selectable rows stay a single anchor — one big click target to Spotify.
  if (!onSelect) {
    return (
      <a
        href={track.url}
        target="_blank"
        rel="noopener noreferrer"
        className={cx(rowClass, "hover:bg-surface-hover")}
      >
        {body}
        <OpenIcon className="text-faint opacity-0 transition-opacity group-hover:opacity-100" />
      </a>
    );
  }

  // Selectable rows can't nest the anchor inside the button, so the row is a
  // button and the Spotify link is a sibling on the arrow.
  return (
    <div
      className={cx(
        rowClass,
        selected ? "bg-accent-soft" : "hover:bg-surface-hover"
      )}
    >
      <button
        type="button"
        onClick={onSelect}
        aria-pressed={selected}
        className="flex min-w-0 flex-1 items-center gap-3 text-left"
      >
        {body}
      </button>
      <a
        href={track.url}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`Open ${track.name} on Spotify`}
        className="text-faint opacity-0 transition-opacity hover:text-ink group-hover:opacity-100"
      >
        <OpenIcon />
      </a>
    </div>
  );
}

/** Height of one TrackItem row: 40px album art + 2 x 10px padding + 1px border. */
const ROW_HEIGHT = 61;

function TrackPanel({
  children,
  className,
  /** Cap the panel at this many rows (fractional to hint at more) and scroll the rest inside it. */
  maxRows,
}: {
  children: React.ReactNode;
  className?: string;
  maxRows?: number;
}) {
  return (
    <div
      className={cx(
        "overflow-hidden rounded-[var(--radius-lg)] border border-border bg-surface",
        className
      )}
    >
      <div
        className={maxRows ? "overflow-y-auto overscroll-contain" : undefined}
        style={maxRows ? { maxHeight: maxRows * ROW_HEIGHT } : undefined}
      >
        {children}
      </div>
    </div>
  );
}

export function TopTracks({
  tracks,
  selectedId,
  onSelect,
}: {
  tracks: TopTrack[];
  /** Track currently loaded in the album panel, highlighted in the list. */
  selectedId?: string | null;
  /** Omit to keep rows as plain links to Spotify. */
  onSelect?: (track: TopTrack, index: number) => void;
}) {
  if (tracks.length === 0) return null;
  return (
    <TrackPanel maxRows={10.5}>
      {tracks.map((track, index) => (
        <TrackItem
          key={track.id}
          track={track}
          rank={index + 1}
          meta={track.album}
          selected={selectedId != null && track.id === selectedId}
          onSelect={onSelect ? () => onSelect(track, index) : undefined}
        />
      ))}
    </TrackPanel>
  );
}

export function RecentlyPlayed({ tracks }: { tracks: RecentTrack[] }) {
  if (tracks.length === 0) return null;
  return (
    <TrackPanel maxRows={10.5}>
      {tracks.map((track) => (
        <TrackItem
          key={`${track.id}-${track.played_at}`}
          track={track}
          meta={getRelativeTime(track.played_at)}
        />
      ))}
    </TrackPanel>
  );
}

export function SavedTracksList({ tracks }: { tracks: SavedTrack[] }) {
  if (tracks.length === 0) return null;
  return (
    <TrackPanel>
      {tracks.slice(0, 20).map((track) => (
        <TrackItem
          key={`${track.id}-${track.added_at}`}
          track={track}
          meta={getRelativeTime(track.added_at)}
        />
      ))}
    </TrackPanel>
  );
}
