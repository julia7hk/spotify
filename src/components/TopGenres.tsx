import { Card } from "./Section";
import { GenresUnavailable } from "./EmptyState";

interface TopGenresProps {
  genres: [string, number][];
  available: boolean;
}

export function TopGenres({ genres, available }: TopGenresProps) {
  if (!available || genres.length === 0) {
    return <GenresUnavailable title="No genre data to rank" />;
  }

  const max = genres[0][1];

  return (
    <Card>
      <div className="space-y-2">
        {genres.map(([genre, count], index) => (
          <div key={genre} className="flex items-center gap-3">
            <span className="w-28 shrink-0 truncate text-right text-xs capitalize text-muted">
              {genre}
            </span>
            <div className="h-6 flex-1 overflow-hidden rounded-[5px] bg-surface-sunken">
              <div
                className="grow-x flex h-full items-center justify-end rounded-[5px] bg-accent pr-2"
                style={{
                  width: `${Math.max((count / max) * 100, 6)}%`,
                  animationDelay: `${index * 40}ms`,
                }}
              >
                <span className="text-[11px] font-semibold text-on-accent tabular">
                  {count}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
