import type { MoodAnalysis } from "@/types/spotify";
import { Card } from "./Section";
import { GenresUnavailable } from "./EmptyState";

/**
 * Moods keep distinct hues (they're categorical, not sequential), but the set
 * is temperature-matched to the periwinkle accent rather than the previous
 * unrelated primaries.
 */
const MOOD_COLORS: Record<string, string> = {
  happy: "var(--mood-happy)",
  sad: "var(--mood-sad)",
  energetic: "var(--mood-energetic)",
  chill: "var(--mood-chill)",
  angry: "var(--mood-angry)",
};

export function MoodChart({ moodAnalysis }: { moodAnalysis: MoodAnalysis }) {
  if (!moodAnalysis.genres_available || !moodAnalysis.dominant_mood) {
    return <GenresUnavailable title="Mood can't be inferred right now" />;
  }

  const moods = Object.entries(moodAnalysis.mood_breakdown)
    .filter(([, pct]) => pct > 0)
    .sort((a, b) => b[1] - a[1]);

  return (
    <Card>
      <div className="mb-6 border-b border-border pb-5">
        <p className="text-sm text-muted">Dominant mood</p>
        <p
          className="mt-1 text-3xl font-bold capitalize"
          style={{ color: MOOD_COLORS[moodAnalysis.dominant_mood] }}
        >
          {moodAnalysis.dominant_mood}
        </p>
      </div>

      <div className="space-y-3">
        {moods.map(([mood, pct]) => (
          <div key={mood}>
            <div className="flex items-center gap-3">
              <span className="w-20 shrink-0 text-xs capitalize text-muted">
                {mood}
              </span>
              <div className="h-5 flex-1 overflow-hidden rounded-[5px] bg-surface-sunken">
                <div
                  className="grow-x flex h-full items-center justify-end rounded-[5px] pr-2"
                  style={{
                    width: `${Math.max(pct, 4)}%`,
                    backgroundColor: MOOD_COLORS[mood] ?? "var(--accent)",
                  }}
                >
                  {pct >= 12 && (
                    <span
                      className="text-[10px] font-bold tabular"
                      style={{ color: "var(--on-mood)" }}
                    >
                      {pct}%
                    </span>
                  )}
                </div>
              </div>
              {pct < 12 && (
                <span className="w-9 shrink-0 text-[11px] text-muted tabular">
                  {pct}%
                </span>
              )}
            </div>
            {moodAnalysis.genre_examples?.[mood]?.length > 0 && (
              <div className="ml-[92px] mt-1.5 flex flex-wrap gap-1">
                {moodAnalysis.genre_examples[mood].map((genre) => (
                  <span
                    key={genre}
                    className="rounded-full bg-surface-sunken px-2 py-0.5 text-[10px] capitalize text-muted"
                  >
                    {genre}
                  </span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </Card>
  );
}
