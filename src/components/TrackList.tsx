import Image from "next/image";
import type { TopTrack, RecentTrack } from "@/types/spotify";
import { getRelativeTime } from "@/lib/utils";

interface TrackItemProps {
  track: TopTrack | RecentTrack;
  rank?: number;
  showTimestamp?: boolean;
}

function TrackItem({ track, rank, showTimestamp }: TrackItemProps) {
  const playedAt = "played_at" in track ? track.played_at : null;

  return (
    <a
      href={track.url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-4 px-4 py-3 hover:bg-[#282828] transition-colors"
    >
      {rank !== undefined && (
        <span className="text-[#b3b3b3] text-sm w-8 text-right font-mono">
          {rank}
        </span>
      )}
      <div className="relative w-10 h-10 flex-shrink-0">
        {track.image ? (
          <Image
            src={track.image}
            alt={track.album}
            fill
            sizes="40px"
            className="object-cover rounded"
          />
        ) : (
          <div className="w-full h-full bg-[#282828] rounded flex items-center justify-center">
            <svg
              className="w-5 h-5 text-[#b3b3b3]"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
            </svg>
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium truncate">{track.name}</p>
        <p className="text-sm text-[#b3b3b3] truncate">{track.artist}</p>
      </div>
      {showTimestamp && playedAt ? (
        <p className="text-xs text-[#b3b3b3] whitespace-nowrap">
          {getRelativeTime(playedAt)}
        </p>
      ) : (
        <p className="text-sm text-[#b3b3b3] truncate hidden sm:block max-w-48">
          {track.album}
        </p>
      )}
    </a>
  );
}

interface TopTracksProps {
  tracks: TopTrack[];
}

export function TopTracks({ tracks }: TopTracksProps) {
  if (tracks.length === 0) return null;

  return (
    <section className="mb-10">
      <h2 className="text-2xl font-bold mb-6">Top Tracks</h2>
      <div className="bg-[#181818] rounded-xl overflow-hidden">
        {tracks.map((track, index) => (
          <TrackItem key={track.id} track={track} rank={index + 1} />
        ))}
      </div>
    </section>
  );
}

interface RecentlyPlayedProps {
  tracks: RecentTrack[];
}

export function RecentlyPlayed({ tracks }: RecentlyPlayedProps) {
  if (tracks.length === 0) return null;

  return (
    <section className="mb-10">
      <h2 className="text-2xl font-bold mb-6">Recently Played</h2>
      <div className="bg-[#181818] rounded-xl overflow-hidden">
        {tracks.map((track) => (
          <TrackItem
            key={`${track.id}-${track.played_at}`}
            track={track}
            showTimestamp
          />
        ))}
      </div>
    </section>
  );
}
