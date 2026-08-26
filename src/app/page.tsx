"use client";

import { useState } from "react";
import { useSpotifyData } from "@/hooks/useSpotifyData";
import { TIME_RANGES } from "@/types/spotify";
import {
  LoadingSpinner,
  LoginScreen,
  Section,
  ProfileHeader,
  StatsOverview,
  TimeRangeToggle,
  LibraryTimeline,
  TopGenres,
  TopArtists,
  TopTracks,
  AlbumPanel,
  RecentlyPlayed,
  SavedTracksList,
  PlaylistGrid,
  ListeningStatsSection,
  GenreProfile,
  MoodChart,
} from "@/components";

export default function Home() {
  const { data, loading, refreshing, range, setRange, login, logout } =
    useSpotifyData();
  // Index into topTracks, so the panel's prev/next can step through the list.
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  if (loading) return <LoadingSpinner />;
  if (!data) return <LoginScreen onLogin={login} />;

  const rangeLabel =
    TIME_RANGES.find((r) => r.value === range)?.label.toLowerCase() ?? "";
  const genresAvailable = data.listeningProfile?.genres_available ?? false;
  // Index-based, so a range switch that returns a shorter list can't strand it.
  const selectedTrack =
    selectedIndex !== null ? data.topTracks[selectedIndex] ?? null : null;

  return (
    <div className="min-h-screen px-6 py-10 sm:px-8">
      <div className="mx-auto max-w-6xl">
        <ProfileHeader
          profile={data.profile}
          playlistCount={data.playlists.length}
          savedCount={data.savedTracks?.total}
          onLogout={logout}
        />

        {/* The dashboard's primary control — everything range-sensitive below
            re-fetches when this changes. */}
        <div className="mb-8 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-muted">
            Showing stats for{" "}
            <span className="font-semibold text-ink">{rangeLabel}</span>
          </p>
          <TimeRangeToggle
            value={range}
            onChange={setRange}
            busy={refreshing}
          />
        </div>

        {/* Stale data stays visible while a new range loads. */}
        <div
          className={
            refreshing ? "opacity-60 transition-opacity" : "transition-opacity"
          }
        >
          {data.listeningProfile && (
            <StatsOverview
              listeningProfile={data.listeningProfile}
              savedTotal={data.savedTracks?.total}
              playlistCount={data.playlists.length}
            />
          )}

          <Section
            title="Top artists"
            subtitle={`Your most played, ${rangeLabel}`}
          >
            <TopArtists artists={data.topArtists} />
          </Section>

          {/* Top tracks drives the album panel beside it: clicking a row loads
              that song's album, and the panel's controls step through the
              ranking rather than playing anything. */}
          <div className="mb-12 grid grid-cols-1 gap-6 lg:grid-cols-[1fr_20rem]">
            <Section
              title="Top tracks"
              subtitle={`Ranked, ${rangeLabel}`}
              className="mb-0"
            >
              <TopTracks
                tracks={data.topTracks}
                selectedId={selectedTrack?.id ?? null}
                onSelect={(_track, index) => setSelectedIndex(index)}
              />
            </Section>

            <Section title="Album" subtitle="From the selected track" className="mb-0">
              <AlbumPanel
                track={selectedTrack}
                rank={selectedIndex !== null ? selectedIndex + 1 : undefined}
                hasPrev={selectedIndex !== null && selectedIndex > 0}
                hasNext={
                  selectedIndex !== null &&
                  selectedIndex < data.topTracks.length - 1
                }
                onPrev={() =>
                  setSelectedIndex((i) => (i === null ? null : Math.max(0, i - 1)))
                }
                onNext={() =>
                  setSelectedIndex((i) =>
                    i === null
                      ? null
                      : Math.min(data.topTracks.length - 1, i + 1)
                  )
                }
              />
            </Section>
          </div>

          <Section title="Recently played" subtitle="Your last 50 plays">
            <RecentlyPlayed tracks={data.recentlyPlayed} />
          </Section>

          {data.savedTracks && data.savedTracks.added_by_month.length > 0 && (
            <Section
              title="Library growth"
              subtitle="When you saved the tracks in your library"
            >
              <LibraryTimeline
                months={data.savedTracks.added_by_month}
                total={data.savedTracks.total}
              />
            </Section>
          )}

          {data.savedTracks && data.savedTracks.tracks.length > 0 && (
            <Section
              title="Recently saved"
              subtitle="The newest additions to your library"
            >
              <SavedTracksList tracks={data.savedTracks.tracks} />
            </Section>
          )}

          {data.listeningStats && (
            <Section
              title="How your taste shifted"
              subtitle="All three windows side by side"
            >
              <ListeningStatsSection stats={data.listeningStats} />
            </Section>
          )}

          {/* Genre-derived sections. Spotify no longer serves artist genres, so
              these render an explanatory empty state until Last.fm lands.
              Collapsed into one group so three empty cards don't dominate. */}
          {data.listeningProfile && (
            <Section
              title="Genres & mood"
              subtitle={
                genresAvailable
                  ? "What you listen to, and how it feels"
                  : "Waiting on an enrichment source"
              }
            >
              {genresAvailable ? (
                <div className="space-y-3">
                  <TopGenres
                    genres={data.listeningProfile.top_genres}
                    available
                  />
                  {data.genreProfile && (
                    <GenreProfile genreProfile={data.genreProfile} />
                  )}
                  {data.moodAnalysis && (
                    <MoodChart moodAnalysis={data.moodAnalysis} />
                  )}
                </div>
              ) : (
                <TopGenres genres={[]} available={false} />
              )}
            </Section>
          )}

          <Section
            title="Your playlists"
            subtitle={`${data.playlists.length} total`}
          >
            <PlaylistGrid playlists={data.playlists} />
          </Section>
        </div>
      </div>
    </div>
  );
}
