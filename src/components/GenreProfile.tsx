import type { GenreProfile as GenreProfileType } from "@/types/spotify";

interface GenreProfileProps {
  genreProfile: GenreProfileType;
}

export function GenreProfile({ genreProfile }: GenreProfileProps) {
  const maxCount = Math.max(...genreProfile.genres.map((g) => g.count));

  return (
    <section className="mb-10">
      <h2 className="text-2xl font-bold mb-2">Genre Profile</h2>
      <p className="text-[#AED9E0] text-sm mb-6">
        Your music taste distribution
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-[#6E7482] rounded-xl p-4 text-center">
          <p className="text-3xl font-bold text-[#FFA69E]">
            {genreProfile.unique_genres}
          </p>
          <p className="text-sm text-[#AED9E0]">Unique Genres</p>
        </div>
        <div className="bg-[#6E7482] rounded-xl p-4 text-center">
          <p className="text-3xl font-bold text-[#AED9E0]">
            {genreProfile.diversity_score}%
          </p>
          <p className="text-sm text-[#AED9E0]">Diversity Score</p>
        </div>
        <div className="bg-[#6E7482] rounded-xl p-4 text-center">
          <p className="text-xl font-bold text-white truncate">
            {genreProfile.top_genre || "N/A"}
          </p>
          <p className="text-sm text-[#AED9E0]">Top Genre</p>
        </div>
      </div>

      <div className="bg-[#6E7482] rounded-xl p-6">
        <h3 className="text-lg font-semibold mb-4">Genre Distribution</h3>
        <div className="space-y-3">
          {genreProfile.genres.map((genre, index) => (
            <div key={genre.name} className="flex items-center gap-3">
              <span className="w-6 text-xs text-[#AED9E0] text-right">
                {index + 1}
              </span>
              <span className="w-32 text-sm truncate" title={genre.name}>
                {genre.name}
              </span>
              <div className="flex-1 h-5 bg-[#5E6472] rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${(genre.count / maxCount) * 100}%`,
                    backgroundColor: getGenreColor(index),
                  }}
                />
              </div>
              <span className="w-8 text-xs text-[#AED9E0] text-right">
                {genre.count}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function getGenreColor(index: number): string {
  const colors = [
    "#FFA69E",
    "#AED9E0",
    "#FFD93D",
    "#6B7FD7",
    "#FF6B6B",
    "#B8F2E6",
    "#FF4757",
    "#A8E6CF",
    "#FDCB6E",
    "#74B9FF",
    "#E17055",
    "#00B894",
    "#6C5CE7",
    "#FFEAA7",
    "#81ECEC",
  ];
  return colors[index % colors.length];
}
