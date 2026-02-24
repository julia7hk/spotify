import type { ListeningStats } from "@/types/spotify";

interface ListeningStatsProps {
  stats: ListeningStats;
}

const timeRangeOrder = ["Last 4 weeks", "Last 6 months", "All time"];

export function ListeningStatsSection({ stats }: ListeningStatsProps) {
  const sortedRanges = timeRangeOrder.filter((range) => stats[range]);

  return (
    <section className="mb-10">
      <h2 className="text-2xl font-bold mb-2">Your Listening Journey</h2>
      <p className="text-[#AED9E0] text-sm mb-6">
        See how your taste has evolved
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {sortedRanges.map((range) => (
          <div key={range} className="bg-[#6E7482] rounded-xl p-5">
            <h3 className="text-lg font-semibold mb-4 text-[#B8F2E6]">{range}</h3>

            <div className="mb-4">
              <p className="text-xs text-[#AED9E0] mb-2 uppercase tracking-wide">
                Top Artists
              </p>
              <ol className="space-y-1">
                {stats[range].top_artists.map((artist, idx) => (
                  <li key={idx} className="flex items-center gap-2">
                    <span className="text-xs text-[#AED9E0] w-4">{idx + 1}.</span>
                    <span className="text-sm truncate">{artist}</span>
                  </li>
                ))}
              </ol>
            </div>

            <div>
              <p className="text-xs text-[#AED9E0] mb-2 uppercase tracking-wide">
                Top Tracks
              </p>
              <ol className="space-y-1">
                {stats[range].top_tracks.map((track, idx) => (
                  <li key={idx} className="flex items-center gap-2">
                    <span className="text-xs text-[#AED9E0] w-4">{idx + 1}.</span>
                    <div className="min-w-0 flex-1">
                      <span className="text-sm truncate block">{track.name}</span>
                      <span className="text-xs text-[#AED9E0] truncate block">
                        {track.artist}
                      </span>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
