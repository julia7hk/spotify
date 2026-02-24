import Image from "next/image";
import type { Recommendation } from "@/types/spotify";

interface RecommendationsProps {
  recommendations: Recommendation[];
}

export function Recommendations({ recommendations }: RecommendationsProps) {
  if (recommendations.length === 0) return null;

  return (
    <section className="mb-10">
      <h2 className="text-2xl font-bold mb-2">Recommended For You</h2>
      <p className="text-[#AED9E0] text-sm mb-6">
        Based on your recent listening
      </p>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {recommendations.slice(0, 10).map((track) => (
          <a
            key={track.id}
            href={track.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group bg-[#6E7482] hover:bg-[#7E8492] rounded-lg p-3 transition-all"
          >
            <div className="relative aspect-square mb-3 rounded-md overflow-hidden shadow-lg">
              {track.image ? (
                <Image
                  src={track.image}
                  alt={track.name}
                  fill
                  sizes="200px"
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
              ) : (
                <div className="w-full h-full bg-[#5E6472] flex items-center justify-center">
                  <svg
                    className="w-12 h-12 text-[#AED9E0]"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
                  </svg>
                </div>
              )}
              {track.preview_url && (
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <svg
                    className="w-12 h-12 text-white"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </div>
              )}
            </div>
            <h3 className="font-semibold text-sm truncate">{track.name}</h3>
            <p className="text-xs text-[#AED9E0] truncate">{track.artist}</p>
          </a>
        ))}
      </div>
    </section>
  );
}
