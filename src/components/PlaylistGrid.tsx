import Image from "next/image";
import type { Playlist } from "@/types/spotify";

interface PlaylistCardProps {
  playlist: Playlist;
}

function PlaylistCard({ playlist }: PlaylistCardProps) {
  return (
    <a
      href={playlist.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group bg-[#181818] hover:bg-[#282828] rounded-lg p-4 transition-all"
    >
      <div className="relative mb-4 aspect-square">
        {playlist.image ? (
          <Image
            src={playlist.image}
            alt={playlist.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
            className="object-cover rounded-md shadow-lg"
          />
        ) : (
          <div className="w-full h-full bg-[#282828] rounded-md flex items-center justify-center">
            <svg
              className="w-16 h-16 text-[#b3b3b3]"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
            </svg>
          </div>
        )}
        <button className="absolute bottom-2 right-2 w-12 h-12 bg-[#1DB954] rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all shadow-xl">
          <svg
            className="w-5 h-5 text-black ml-1"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M8 5v14l11-7z" />
          </svg>
        </button>
      </div>
      <h3 className="font-semibold truncate mb-1">{playlist.name}</h3>
      <p className="text-sm text-[#b3b3b3]">{playlist.tracks} tracks</p>
    </a>
  );
}

interface PlaylistGridProps {
  playlists: Playlist[];
}

export function PlaylistGrid({ playlists }: PlaylistGridProps) {
  if (playlists.length === 0) return null;

  return (
    <section className="mb-10">
      <h2 className="text-2xl font-bold mb-2">Your Playlists</h2>
      <p className="text-[#b3b3b3] mb-6">{playlists.length} playlists</p>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
        {playlists.map((playlist) => (
          <PlaylistCard key={playlist.id} playlist={playlist} />
        ))}
      </div>
    </section>
  );
}
