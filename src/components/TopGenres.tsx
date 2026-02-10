interface TopGenresProps {
  genres: [string, number][];
}

export function TopGenres({ genres }: TopGenresProps) {
  if (genres.length === 0) return null;

  const maxCount = genres[0][1];

  return (
    <section className="mb-10">
      <h2 className="text-2xl font-bold mb-6">Top Genres</h2>
      <div className="space-y-3">
        {genres.map(([genre, count], index) => {
          const percentage = (count / maxCount) * 100;
          return (
            <div key={genre} className="flex items-center gap-4">
              <span className="text-sm text-[#b3b3b3] w-32 text-right truncate capitalize">
                {genre}
              </span>
              <div className="flex-1 h-8 bg-[#282828] rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full flex items-center justify-end pr-3"
                  style={{
                    width: `${Math.max(percentage, 8)}%`,
                    background: "linear-gradient(90deg, #1DB954, #1ed760)",
                    transitionDelay: `${index * 50}ms`,
                  }}
                >
                  <span className="text-xs font-bold text-black">{count}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
