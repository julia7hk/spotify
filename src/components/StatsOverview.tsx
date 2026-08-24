import Link from "next/link";
import type { ListeningProfile } from "@/types/spotify";
import { formatDuration } from "@/lib/utils";
import { Card } from "./Section";

interface StatTileProps {
  label: string;
  value: string;
  unit?: string;
  /** 0–1, renders a meter under the value. */
  meter?: number;
  href?: string;
  hint?: string;
}

function StatTile({ label, value, unit, meter, href, hint }: StatTileProps) {
  const body = (
    <>
      <p className="text-sm text-muted">{label}</p>
      <p className="mt-2 text-3xl font-bold tracking-tight text-ink tabular">
        {value}
        {unit && (
          <span className="ml-0.5 text-base font-medium text-muted">
            {unit}
          </span>
        )}
      </p>
      {meter !== undefined && (
        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-surface-sunken">
          <div
            className="grow-x h-full rounded-full bg-accent"
            style={{ width: `${Math.min(Math.max(meter, 0), 1) * 100}%` }}
          />
        </div>
      )}
      {hint && <p className="mt-2 text-xs text-faint">{hint}</p>}
    </>
  );

  if (href) {
    return (
      <Link
        href={href}
        className="group rounded-[var(--radius-lg)] border border-border bg-surface p-5 transition-colors hover:border-border-strong hover:bg-surface-hover"
      >
        {body}
        <span className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-accent">
          View details
          <svg
            aria-hidden
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-3 w-3 transition-transform group-hover:translate-x-0.5"
          >
            <path d="M5 12h14M13 6l6 6-6 6" />
          </svg>
        </span>
      </Link>
    );
  }

  return <Card>{body}</Card>;
}

interface StatsOverviewProps {
  listeningProfile: ListeningProfile;
  savedTotal?: number | null;
  playlistCount: number;
}

export function StatsOverview({
  listeningProfile,
  savedTotal,
  playlistCount,
}: StatsOverviewProps) {
  const duration = formatDuration(listeningProfile.avg_duration_min);

  const tiles: StatTileProps[] = [];

  if (savedTotal != null) {
    tiles.push({ label: "Tracks saved", value: savedTotal.toLocaleString() });
  }

  tiles.push({ label: "Playlists", value: String(playlistCount) });

  if (duration) {
    tiles.push({
      label: "Avg. track length",
      value: `${duration.min}:${String(duration.sec).padStart(2, "0")}`,
    });
  }

  if (listeningProfile.explicit_ratio != null) {
    tiles.push({
      label: "Explicit",
      value: String(Math.round(listeningProfile.explicit_ratio * 100)),
      unit: "%",
      meter: listeningProfile.explicit_ratio,
    });
  }

  // Only shown if Spotify ever serves track popularity again.
  if (
    listeningProfile.popularity_available &&
    listeningProfile.avg_popularity != null
  ) {
    tiles.push({
      label: "Avg. popularity",
      value: String(listeningProfile.avg_popularity),
      unit: "/ 100",
      meter: listeningProfile.avg_popularity / 100,
      href: "/popularity",
    });
  }

  if (tiles.length === 0) return null;

  return (
    <div className="mb-12 grid grid-cols-2 gap-3 lg:grid-cols-4">
      {tiles.map((tile) => (
        <StatTile key={tile.label} {...tile} />
      ))}
    </div>
  );
}
