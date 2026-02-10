import Image from "next/image";
import type { TopArtist } from "@/types/spotify";

interface ArtistCardProps {
  artist: TopArtist;
  rank: number;
}

export function ArtistCard({ artist, rank }: ArtistCardProps) {
  return (
    <a
      href={artist.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex-shrink-0 w-40 bg-[#181818] hover:bg-[#282828] rounded-lg p-4 transition-all"
    >
      <div className="relative mb-3 aspect-square">
        {artist.image ? (
          <Image
            src={artist.image}
            alt={artist.name}
            fill
            sizes="160px"
            className="object-cover rounded-full shadow-lg"
          />
        ) : (
          <div className="w-full h-full bg-[#282828] rounded-full flex items-center justify-center">
            <svg
              className="w-12 h-12 text-[#b3b3b3]"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
            </svg>
          </div>
        )}
      </div>
      <h3 className="font-semibold text-sm truncate text-center">
        {artist.name}
      </h3>
      <p className="text-xs text-[#b3b3b3] text-center mt-1">
        #{rank} · {artist.genres[0] || "Artist"}
      </p>
    </a>
  );
}

interface TopArtistsProps {
  artists: TopArtist[];
}

export function TopArtists({ artists }: TopArtistsProps) {
  if (artists.length === 0) return null;

  return (
    <section className="mb-10">
      <h2 className="text-2xl font-bold mb-6">Top Artists</h2>
      <div className="flex gap-4 overflow-x-auto pb-4 -mx-2 px-2">
        {artists.map((artist, index) => (
          <ArtistCard key={artist.id} artist={artist} rank={index + 1} />
        ))}
      </div>
    </section>
  );
}
