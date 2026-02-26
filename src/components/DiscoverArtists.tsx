import Image from "next/image";
import type { DiscoveredArtist } from "@/types/spotify";

interface DiscoverArtistsProps {
  artists: DiscoveredArtist[];
}

export function DiscoverArtists({ artists }: DiscoverArtistsProps) {
  if (artists.length === 0) return null;

  return (
    <section className="mb-10">
      <h2 className="text-2xl font-bold mb-2">Discover New Artists</h2>
      <p className="text-[#AED9E0] text-sm mb-6">
        Artists similar to your favorites
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {artists.map((artist) => (
          <div
            key={artist.id}
            className="bg-[#6E7482] rounded-xl p-4 hover:bg-[#7E8492] transition-colors"
          >
            <div className="flex gap-4">
              <a
                href={artist.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-shrink-0"
              >
                <div className="relative w-20 h-20">
                  {artist.image ? (
                    <Image
                      src={artist.image}
                      alt={artist.name}
                      fill
                      sizes="80px"
                      className="object-cover rounded-full"
                    />
                  ) : (
                    <div className="w-full h-full bg-[#AED9E0] rounded-full flex items-center justify-center">
                      <svg
                        className="w-8 h-8 text-[#5E6472]"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                      </svg>
                    </div>
                  )}
                </div>
              </a>

              <div className="flex-1 min-w-0">
                <a
                  href={artist.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-lg hover:text-[#AED9E0] transition-colors truncate block"
                >
                  {artist.name}
                </a>
                <p className="text-sm text-[#AED9E0] mb-2">
                  Similar to {artist.similar_to}
                </p>
                {artist.genres.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-2">
                    {artist.genres.map((genre) => (
                      <span
                        key={genre}
                        className="text-xs bg-[#5E6472] px-2 py-0.5 rounded-full"
                      >
                        {genre}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {artist.top_tracks.length > 0 && (
              <div className="mt-3 pt-3 border-t border-[#5E6472]">
                <p className="text-xs text-[#AED9E0] mb-2">Top Tracks</p>
                <div className="space-y-1">
                  {artist.top_tracks.map((track) => (
                    <a
                      key={track.id}
                      href={track.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-sm hover:text-[#AED9E0] transition-colors"
                    >
                      {track.image && (
                        <Image
                          src={track.image}
                          alt={track.name}
                          width={24}
                          height={24}
                          className="rounded"
                        />
                      )}
                      <span className="truncate">{track.name}</span>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
