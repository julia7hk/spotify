import type { AudioFeatures } from "@/types/spotify";

interface AudioProfileProps {
  audioFeatures: AudioFeatures;
}

const featureLabels: Record<string, { label: string; color: string }> = {
  danceability: { label: "Danceability", color: "#FFA69E" },
  energy: { label: "Energy", color: "#FF6B6B" },
  valence: { label: "Happiness", color: "#B8F2E6" },
  acousticness: { label: "Acoustic", color: "#AED9E0" },
  instrumentalness: { label: "Instrumental", color: "#93E1D8" },
  speechiness: { label: "Speechiness", color: "#DDFFF7" },
};

export function AudioProfile({ audioFeatures }: AudioProfileProps) {
  const features = Object.entries(featureLabels).map(([key, { label, color }]) => ({
    key,
    label,
    color,
    value: audioFeatures.averages[key as keyof typeof audioFeatures.averages] as number,
  }));

  return (
    <section className="mb-10">
      <h2 className="text-2xl font-bold mb-2">Your Sound Profile</h2>
      <p className="text-[#AED9E0] text-sm mb-6">
        Based on your top {audioFeatures.track_count} tracks
      </p>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {features.map(({ key, label, color, value }) => (
          <div key={key} className="bg-[#6E7482] rounded-xl p-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-[#AED9E0]">{label}</span>
              <span className="text-lg font-bold">{Math.round(value * 100)}%</span>
            </div>
            <div className="h-2 bg-[#5E6472] rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${value * 100}%`,
                  backgroundColor: color,
                }}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 bg-[#6E7482] rounded-xl p-4 flex items-center gap-4">
        <div className="text-center flex-1">
          <p className="text-[#AED9E0] text-sm">Avg. Tempo</p>
          <p className="text-2xl font-bold">
            {Math.round(audioFeatures.averages.tempo)}
            <span className="text-sm text-[#AED9E0] font-normal"> BPM</span>
          </p>
        </div>
      </div>
    </section>
  );
}
