import type { MoodAnalysis } from "@/types/spotify";

interface MoodChartProps {
  moodAnalysis: MoodAnalysis;
}

const moodEmojis: Record<string, string> = {
  happy: "sunny",
  sad: "cloud-rain",
  energetic: "bolt",
  chill: "moon",
  angry: "flame",
};

const moodColors: Record<string, string> = {
  happy: "#FFD93D",
  sad: "#6B7FD7",
  energetic: "#FF6B6B",
  chill: "#B8F2E6",
  angry: "#FF4757",
};

export function MoodChart({ moodAnalysis }: MoodChartProps) {
  const moods = Object.entries(moodAnalysis.mood_breakdown)
    .filter(([_, percentage]) => percentage > 0)
    .sort((a, b) => b[1] - a[1]);

  return (
    <section className="mb-10">
      <h2 className="text-2xl font-bold mb-2">Your Music Mood</h2>
      <p className="text-[#AED9E0] text-sm mb-6">
        How your music makes you feel
      </p>

      <div className="bg-[#6E7482] rounded-xl p-6">
        <div className="text-center mb-6">
          <p className="text-[#AED9E0] text-sm mb-2">Dominant Mood</p>
          <p
            className="text-4xl font-bold capitalize"
            style={{ color: moodColors[moodAnalysis.dominant_mood] || "#FFA69E" }}
          >
            {moodAnalysis.dominant_mood}
          </p>
        </div>

        <div className="space-y-3">
          {moods.map(([mood, percentage]) => (
            <div key={mood} className="flex items-center gap-3">
              <span className="w-24 text-sm text-[#AED9E0] capitalize">{mood}</span>
              <div className="flex-1 h-6 bg-[#5E6472] rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full flex items-center justify-end pr-2 transition-all duration-500"
                  style={{
                    width: `${Math.max(percentage, 5)}%`,
                    backgroundColor: moodColors[mood] || "#AED9E0",
                  }}
                >
                  {percentage >= 10 && (
                    <span className="text-xs font-bold text-[#5E6472]">
                      {percentage}%
                    </span>
                  )}
                </div>
              </div>
              {percentage < 10 && (
                <span className="text-xs text-[#AED9E0] w-10">{percentage}%</span>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
