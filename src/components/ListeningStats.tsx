import Image from "next/image";
import type { ListeningStats } from "@/types/spotify";
import { Card } from "./Section";

const RANGE_ORDER = ["Last 4 weeks", "Last 6 months", "All time"];

function MiniRow({
  rank,
  image,
  title,
  subtitle,
  url,
}: {
  rank: number;
  image: string | null;
  title: string;
  subtitle?: string;
  url: string;
  rounded?: boolean;
}) {
  return (
    <li>
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="group flex items-center gap-2.5 rounded-[var(--radius-sm)] px-1.5 py-1 transition-colors hover:bg-surface-hover"
      >
        <span className="w-3 shrink-0 font-mono text-[11px] text-faint tabular">
          {rank}
        </span>
        {image ? (
          <Image
            src={image}
            alt=""
            width={28}
            height={28}
            className="rounded-[4px] object-cover"
            style={{ width: 28, height: 28 }}
          />
        ) : (
          <div className="h-7 w-7 shrink-0 rounded-[4px] bg-surface-sunken" />
        )}
        <div className="min-w-0 flex-1">
          <p className="truncate text-[13px] font-medium text-ink">{title}</p>
          {subtitle && (
            <p className="truncate text-[11px] text-muted">{subtitle}</p>
          )}
        </div>
      </a>
    </li>
  );
}

/**
 * Side-by-side comparison of all three windows at once — complements the
 * TimeRangeToggle, which switches the rest of the page one window at a time.
 */
export function ListeningStatsSection({ stats }: { stats: ListeningStats }) {
  const ranges = RANGE_ORDER.filter((r) => stats[r]);
  if (ranges.length === 0) return null;

  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
      {ranges.map((range) => (
        <Card key={range}>
          <h3 className="mb-4 inline-flex rounded-full bg-accent-soft px-2.5 py-1 text-xs font-semibold text-accent">
            {range}
          </h3>

          <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-faint">
            Artists
          </p>
          <ol className="mb-4 space-y-0.5">
            {stats[range].top_artists.map((artist, i) => (
              <MiniRow
                key={artist.id ?? i}
                rank={i + 1}
                image={artist.image}
                title={artist.name}
                url={artist.url}
              />
            ))}
          </ol>

          <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-faint">
            Tracks
          </p>
          <ol className="space-y-0.5">
            {stats[range].top_tracks.map((track, i) => (
              <MiniRow
                key={track.id ?? i}
                rank={i + 1}
                image={track.image}
                title={track.name}
                subtitle={track.artist}
                url={track.url}
              />
            ))}
          </ol>
        </Card>
      ))}
    </div>
  );
}
