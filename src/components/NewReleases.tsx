import Image from "next/image";
import type { NewRelease } from "@/types/spotify";

interface NewReleasesProps {
  releases: NewRelease[];
}

export function NewReleases({ releases }: NewReleasesProps) {
  if (releases.length === 0) return null;

  return (
    <section className="mb-10">
      <h2 className="text-2xl font-bold mb-2">New Releases</h2>
      <p className="text-[#AED9E0] text-sm mb-6">Fresh music to discover</p>

      <div className="flex gap-4 overflow-x-auto pb-4 -mx-2 px-2">
        {releases.map((album) => (
          <a
            key={album.id}
            href={album.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex-shrink-0 w-44 bg-[#6E7482] hover:bg-[#7E8492] rounded-lg p-3 transition-all"
          >
            <div className="relative aspect-square mb-3 rounded-md overflow-hidden shadow-lg">
              {album.image ? (
                <Image
                  src={album.image}
                  alt={album.name}
                  fill
                  sizes="176px"
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
              ) : (
                <div className="w-full h-full bg-[#5E6472] flex items-center justify-center">
                  <svg
                    className="w-12 h-12 text-[#AED9E0]"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 14.5c-2.49 0-4.5-2.01-4.5-4.5S9.51 7.5 12 7.5s4.5 2.01 4.5 4.5-2.01 4.5-4.5 4.5zm0-5.5c-.55 0-1 .45-1 1s.45 1 1 1 1-.45 1-1-.45-1-1-1z" />
                  </svg>
                </div>
              )}
            </div>
            <h3 className="font-semibold text-sm truncate">{album.name}</h3>
            <p className="text-xs text-[#AED9E0] truncate">{album.artist}</p>
            <p className="text-xs text-[#AED9E0] mt-1">
              {album.total_tracks} tracks · {album.release_date}
            </p>
          </a>
        ))}
      </div>
    </section>
  );
}
