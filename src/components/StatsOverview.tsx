import Link from "next/link";
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
        <Link
          href="/popularity"
          className="bg-[#6E7482] hover:bg-[#7E8492] rounded-xl p-6 transition-colors cursor-pointer"
        >
          <p className="text-[#AED9E0] text-sm mb-1">Avg. Popularity</p>
          <p className="text-3xl font-bold">
            {listeningProfile.avg_popularity}
            <span className="text-lg text-[#AED9E0] font-normal"> / 100</span>
          </p>
          <div className="mt-3 h-1.5 bg-[#AED9E0] rounded-full overflow-hidden">
            <div
              className="h-full bg-[#FFA69E] rounded-full"
              style={{ width: `${listeningProfile.avg_popularity}%` }}
            />
          </div>
        </Link>

        <div className="bg-[#6E7482] rounded-xl p-6">
          <p className="text-[#AED9E0] text-sm mb-1">Avg. Track Length</p>
          <p className="text-3xl font-bold">
            {duration.min}
            <span className="text-lg text-[#AED9E0] font-normal">m </span>
            {duration.sec}
            <span className="text-lg text-[#AED9E0] font-normal">s</span>
          </p>
        </div>

        <div className="bg-[#6E7482] rounded-xl p-6">
          <p className="text-[#AED9E0] text-sm mb-1">Explicit Content</p>
          <p className="text-3xl font-bold">
            {Math.round(listeningProfile.explicit_ratio * 100)}
            <span className="text-lg text-[#AED9E0] font-normal">%</span>
          </p>
          <div className="mt-3 h-1.5 bg-[#AED9E0] rounded-full overflow-hidden">
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
