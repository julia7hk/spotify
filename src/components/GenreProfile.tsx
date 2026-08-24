import type { GenreProfile as GenreProfileType } from "@/types/spotify";
import { Card } from "./Section";
import { GenresUnavailable } from "./EmptyState";

/** Sequential ramp from the token set — one hue, light to dark. */
const RAMP = [
  "var(--data-8)",
  "var(--data-7)",
  "var(--data-6)",
  "var(--data-5)",
  "var(--data-4)",
  "var(--data-3)",
  "var(--data-2)",
  "var(--data-1)",
];

function rampColor(index: number, total: number): string {
  const step = Math.floor((index / Math.max(total - 1, 1)) * (RAMP.length - 1));
  return RAMP[step];
}

export function GenreProfile({
  genreProfile,
}: {
  genreProfile: GenreProfileType;
}) {
  if (!genreProfile.genres_available || genreProfile.genres.length === 0) {
    return <GenresUnavailable title="No genre distribution available" />;
  }

  const max = Math.max(...genreProfile.genres.map((g) => g.count));
  const total = genreProfile.genres.length;

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-3 gap-3">
        <Card>
          <p className="text-3xl font-bold text-accent tabular">
            {genreProfile.unique_genres}
          </p>
          <p className="mt-1 text-sm text-muted">Unique genres</p>
        </Card>
        <Card>
          <p className="text-3xl font-bold text-ink tabular">
            {genreProfile.diversity_score}%
          </p>
          <p className="mt-1 text-sm text-muted">Diversity score</p>
        </Card>
        <Card>
          <p className="truncate text-xl font-bold capitalize text-ink">
            {genreProfile.top_genre ?? "—"}
          </p>
          <p className="mt-1 text-sm text-muted">Top genre</p>
        </Card>
      </div>

      <Card>
        <div className="space-y-1.5">
          {genreProfile.genres.map((genre, index) => (
            <div key={genre.name} className="flex items-center gap-3">
              <span className="w-4 shrink-0 text-right font-mono text-[11px] text-faint tabular">
                {index + 1}
              </span>
              <span
                className="w-28 shrink-0 truncate text-xs capitalize text-ink"
                title={genre.name}
              >
                {genre.name}
              </span>
              <div className="h-4 flex-1 overflow-hidden rounded-[4px] bg-surface-sunken">
                <div
                  className="grow-x h-full rounded-[4px]"
                  style={{
                    width: `${(genre.count / max) * 100}%`,
                    backgroundColor: rampColor(index, total),
                    animationDelay: `${index * 30}ms`,
                  }}
                />
              </div>
              <span className="w-6 shrink-0 text-right text-[11px] text-muted tabular">
                {genre.count}
              </span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
