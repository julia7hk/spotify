import Image from "next/image";
import type { Playlist } from "@/types/spotify";

function PlaylistCard({ playlist }: { playlist: Playlist }) {
  return (
    <a
      href={playlist.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group rounded-[var(--radius-md)] border border-transparent p-2.5 transition-colors hover:border-border hover:bg-surface"
    >
      <div className="relative mb-2.5 aspect-square overflow-hidden rounded-[var(--radius-sm)] bg-surface-sunken">
        {playlist.image ? (
          <Image
            src={playlist.image}
            alt=""
            fill
            sizes="(max-width: 640px) 45vw, (max-width: 1024px) 22vw, 160px"
            className="object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <svg
              className="h-10 w-10 text-faint"
              fill="currentColor"
              viewBox="0 0 24 24"
              aria-hidden
            >
              <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
            </svg>
          </div>
        )}
        <span className="absolute inset-x-0 bottom-0 flex translate-y-full items-center justify-center gap-1.5 bg-accent py-1.5 text-xs font-semibold text-on-accent transition-transform group-hover:translate-y-0">
          Open
          <svg
            aria-hidden
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-3 w-3"
          >
            <path d="M7 17 17 7M9 7h8v8" />
          </svg>
        </span>
      </div>
      <h3 className="truncate text-sm font-medium text-ink">{playlist.name}</h3>
      {/* tracks.total was removed from the API in Aug 2026 — omit rather than print "null tracks". */}
      {playlist.tracks != null && (
        <p className="mt-0.5 text-xs text-muted tabular">
          {playlist.tracks} tracks
        </p>
      )}
    </a>
  );
}

export function PlaylistGrid({ playlists }: { playlists: Playlist[] }) {
  if (playlists.length === 0) return null;

  return (
    <div className="-mx-2.5 grid grid-cols-2 gap-1 sm:grid-cols-4 lg:grid-cols-6">
      {playlists.map((playlist) => (
        <PlaylistCard key={playlist.id} playlist={playlist} />
      ))}
    </div>
  );
}
