"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import type { ListeningProfile, PopularityTrack } from "@/types/spotify";
import { getListeningProfile } from "@/lib/api";
import { Card, EmptyState, LoadingSpinner } from "@/components";

function BackLink() {
  return (
    <Link
      href="/"
      className="mb-8 inline-flex items-center gap-1.5 text-sm font-medium text-muted transition-colors hover:text-ink"
    >
      <svg
        aria-hidden
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-4 w-4"
      >
        <path d="M15 19l-7-7 7-7" />
      </svg>
      Back to dashboard
    </Link>
  );
}

function TrackRow({ track, rank }: { track: PopularityTrack; rank: number }) {
  return (
    <a
      href={track.url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-3 rounded-[var(--radius-md)] border border-border bg-surface p-2.5 transition-colors hover:bg-surface-hover"
    >
      <span className="w-5 shrink-0 text-right font-mono text-xs text-faint tabular">
        {rank}
      </span>
      {track.image ? (
        <Image
          src={track.image}
          alt=""
          width={44}
          height={44}
          className="rounded-[6px] object-cover"
          style={{ width: 44, height: 44 }}
        />
      ) : (
        <div className="h-11 w-11 shrink-0 rounded-[6px] bg-surface-sunken" />
      )}
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-ink">{track.name}</p>
        <p className="truncate text-xs text-muted">{track.artist}</p>
      </div>
      <div className="shrink-0 text-right">
        <p className="text-xl font-bold text-ink tabular">
          {track.popularity ?? "—"}
        </p>
        <p className="text-[10px] uppercase tracking-wide text-faint">
          popularity
        </p>
      </div>
    </a>
  );
}

type SortField = "popularity" | "top_rank";
type SortDirection = "asc" | "desc";

export default function PopularityPage() {
  const [profile, setProfile] = useState<ListeningProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortField, setSortField] = useState<SortField>("popularity");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

  useEffect(() => {
    (async () => {
      try {
        setProfile(await getListeningProfile());
      } catch {
        setError("Failed to load popularity data");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <LoadingSpinner />;

  if (error || !profile) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-10">
        <BackLink />
        <EmptyState
          title="Couldn't load this page"
          reason={error ?? "No data available."}
        />
      </div>
    );
  }

  const tracks = profile.tracks_by_popularity ?? [];

  // Spotify removed track popularity in Aug 2026. Rather than render a page of
  // dashes and a 0/100 meter, say what happened.
  if (!profile.popularity_available) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-10">
        <BackLink />
        <h1 className="mb-2 text-3xl font-extrabold tracking-tight text-ink">
          Popularity analysis
        </h1>
        <p className="mb-8 text-sm text-muted">
          Comparing how mainstream your taste is
        </p>
        <EmptyState
          title="Popularity scores are no longer available"
          reason="Spotify removed the popularity field from track objects in August 2026. Every score this page ranked by now comes back empty, so there is nothing to sort."
          next="Your top tracks are still on the dashboard — they're just ranked by play frequency instead. Reviving this page would need a different signal, such as your own play counts."
        />
      </div>
    );
  }

  const sortedTracks = [...tracks].sort((a, b) => {
    const multiplier = sortDirection === "asc" ? 1 : -1;
    const av = a[sortField] ?? 0;
    const bv = b[sortField] ?? 0;
    return (av - bv) * multiplier;
  });

  const mostPopular = sortedTracks.slice(0, 5);
  const leastPopular = [...sortedTracks].reverse().slice(0, 5);

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection(field === "popularity" ? "desc" : "asc");
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-6 py-10">
      <BackLink />

      <h1 className="mb-2 text-3xl font-extrabold tracking-tight text-ink">
        Popularity analysis
      </h1>
      <p className="mb-8 text-sm text-muted">
        Based on your top {tracks.length} tracks
      </p>

      <Card className="mb-10 text-center">
        <p className="text-sm text-muted">Average popularity</p>
        <p className="mt-1 text-5xl font-bold text-ink tabular">
          {profile.avg_popularity}
          <span className="ml-1 text-lg font-medium text-muted">/ 100</span>
        </p>
        <div className="mx-auto mt-5 h-2 max-w-md overflow-hidden rounded-full bg-surface-sunken">
          <div
            className="grow-x h-full rounded-full bg-accent"
            style={{ width: `${profile.avg_popularity ?? 0}%` }}
          />
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        <section>
          <h2 className="text-lg font-bold text-ink">Most popular</h2>
          <p className="mb-4 text-sm text-muted">Your mainstream favourites</p>
          <div className="space-y-2">
            {mostPopular.map((track, idx) => (
              <TrackRow key={track.id} track={track} rank={idx + 1} />
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-lg font-bold text-ink">Least popular</h2>
          <p className="mb-4 text-sm text-muted">Your hidden gems</p>
          <div className="space-y-2">
            {leastPopular.map((track, idx) => (
              <TrackRow key={track.id} track={track} rank={idx + 1} />
            ))}
          </div>
        </section>
      </div>

      <section className="mt-12">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-bold text-ink">All tracks</h2>
          <div className="flex gap-1 rounded-full border border-border bg-surface p-1">
            {(
              [
                ["popularity", "Popularity"],
                ["top_rank", "Your rank"],
              ] as [SortField, string][]
            ).map(([field, label]) => (
              <button
                key={field}
                onClick={() => toggleSort(field)}
                className={
                  sortField === field
                    ? "rounded-full bg-accent px-3 py-1 text-xs font-semibold text-on-accent"
                    : "rounded-full px-3 py-1 text-xs font-medium text-muted transition-colors hover:bg-surface-hover hover:text-ink"
                }
              >
                {label}
                {sortField === field && (sortDirection === "asc" ? " ↑" : " ↓")}
              </button>
            ))}
          </div>
        </div>
        <div className="space-y-2">
          {sortedTracks.map((track, idx) => (
            <TrackRow key={track.id} track={track} rank={idx + 1} />
          ))}
        </div>
      </section>
    </div>
  );
}
