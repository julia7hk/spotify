import Image from "next/image";
import type { TopArtist } from "@/types/spotify";

interface ArtistCardProps {
  artist: TopArtist;
  rank: number;
}

export function ArtistCard({ artist, rank }: ArtistCardProps) {
  // `genres` is empty until Last.fm enrichment lands, so the subtitle falls
  // back to the rank alone rather than printing a bare "Artist".
  const subtitle = artist.genres[0] ?? null;

  return (
    <a
      href={artist.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group w-[132px] shrink-0 rounded-[var(--radius-lg)] border border-transparent p-3 transition-colors hover:border-border hover:bg-surface"
    >
      <div className="relative mb-3 aspect-square">
        {artist.image ? (
          <Image
            src={artist.image}
            alt=""
            fill
            sizes="132px"
            className="rounded-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center rounded-full bg-surface-sunken">
            <svg
              className="h-10 w-10 text-faint"
              fill="currentColor"
              viewBox="0 0 24 24"
              aria-hidden
            >
              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
            </svg>
          </div>
        )}
        <span className="absolute -left-0.5 -top-0.5 flex h-6 w-6 items-center justify-center rounded-full bg-accent text-[11px] font-bold text-on-accent shadow-[var(--shadow-sm)] tabular">
          {rank}
        </span>
      </div>
      <h3 className="truncate text-center text-sm font-semibold text-ink">
        {artist.name}
      </h3>
      {subtitle && (
        <p className="mt-0.5 truncate text-center text-xs capitalize text-muted">
          {subtitle}
        </p>
      )}
    </a>
  );
}

export function TopArtists({ artists }: { artists: TopArtist[] }) {
  if (artists.length === 0) return null;

  return (
    <div className="-mx-3 flex gap-1 overflow-x-auto px-3 pb-2">
      {artists.map((artist, index) => (
        <ArtistCard key={artist.id} artist={artist} rank={index + 1} />
      ))}
    </div>
  );
}
