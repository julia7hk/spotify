import type { ListeningProfile } from "@/types/spotify";
import { formatDuration } from "@/lib/utils";

interface StatsOverviewProps {
  listeningProfile: ListeningProfile;
}

export function StatsOverview({ listeningProfile }: StatsOverviewProps) {
  const duration = formatDuration(listeningProfile.avg_duration_min);

  return (
    <section className="mb-10">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[#181818] rounded-xl p-6">
          <p className="text-[#b3b3b3] text-sm mb-1">Avg. Popularity</p>
          <p className="text-3xl font-bold">
            {listeningProfile.avg_popularity}
            <span className="text-lg text-[#b3b3b3] font-normal"> / 100</span>
          </p>
          <div className="mt-3 h-1.5 bg-[#282828] rounded-full overflow-hidden">
            <div
              className="h-full bg-[#1DB954] rounded-full"
              style={{ width: `${listeningProfile.avg_popularity}%` }}
            />
          </div>
        </div>

        <div className="bg-[#181818] rounded-xl p-6">
          <p className="text-[#b3b3b3] text-sm mb-1">Avg. Track Length</p>
          <p className="text-3xl font-bold">
            {duration.min}
            <span className="text-lg text-[#b3b3b3] font-normal">m </span>
            {duration.sec}
            <span className="text-lg text-[#b3b3b3] font-normal">s</span>
          </p>
        </div>

        <div className="bg-[#181818] rounded-xl p-6">
          <p className="text-[#b3b3b3] text-sm mb-1">Explicit Content</p>
          <p className="text-3xl font-bold">
            {Math.round(listeningProfile.explicit_ratio * 100)}
            <span className="text-lg text-[#b3b3b3] font-normal">%</span>
          </p>
          <div className="mt-3 h-1.5 bg-[#282828] rounded-full overflow-hidden">
            <div
              className="h-full bg-red-500 rounded-full"
              style={{ width: `${listeningProfile.explicit_ratio * 100}%` }}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
