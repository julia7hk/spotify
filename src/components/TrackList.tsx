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
}

function TrackItem({ track, rank, meta }: TrackItemProps) {
  return (
    <a
      href={track.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex items-center gap-3 border-b border-border px-4 py-2.5 transition-colors last:border-b-0 hover:bg-surface-hover"
    >
      {rank !== undefined && (
        <span className="w-5 shrink-0 text-right font-mono text-xs text-faint tabular">
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
      <svg
        aria-hidden
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-3.5 w-3.5 shrink-0 text-faint opacity-0 transition-opacity group-hover:opacity-100"
      >
        <path d="M7 17 17 7M9 7h8v8" />
      </svg>
    </a>
  );
}

function TrackPanel({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cx(
        "overflow-hidden rounded-[var(--radius-lg)] border border-border bg-surface",
        className
      )}
    >
      {children}
    </div>
  );
}

export function TopTracks({ tracks }: { tracks: TopTrack[] }) {
  if (tracks.length === 0) return null;
  return (
    <TrackPanel>
      {tracks.map((track, index) => (
        <TrackItem
          key={track.id}
          track={track}
          rank={index + 1}
          meta={track.album}
        />
      ))}
    </TrackPanel>
  );
}

export function RecentlyPlayed({ tracks }: { tracks: RecentTrack[] }) {
  if (tracks.length === 0) return null;
  return (
    <TrackPanel>
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
