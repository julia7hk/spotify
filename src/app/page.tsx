"use client";

import { useSpotifyData } from "@/hooks/useSpotifyData";
import {
  LoadingSpinner,
  LoginScreen,
  ProfileHeader,
  StatsOverview,
  TopGenres,
  TopArtists,
  TopTracks,
  RecentlyPlayed,
  PlaylistGrid,
  AudioProfile,
  MoodChart,
  Recommendations,
  NewReleases,
  ListeningStatsSection,
} from "@/components";

export default function Home() {
  const { data, loading, login, logout } = useSpotifyData();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!data) {
    return <LoginScreen onLogin={login} />;
  }

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-6xl mx-auto">
        <ProfileHeader
          profile={data.profile}
          playlistCount={data.playlists.length}
          onLogout={logout}
        />

        {data.listeningProfile && (
          <StatsOverview listeningProfile={data.listeningProfile} />
        )}

        {data.moodAnalysis && <MoodChart moodAnalysis={data.moodAnalysis} />}

        {data.audioFeatures && (
          <AudioProfile audioFeatures={data.audioFeatures} />
        )}

        {data.listeningProfile && (
          <TopGenres genres={data.listeningProfile.top_genres} />
        )}

        <TopArtists artists={data.topArtists} />

        {data.recommendations.length > 0 && (
          <Recommendations recommendations={data.recommendations} />
        )}

        {data.listeningStats && (
          <ListeningStatsSection stats={data.listeningStats} />
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <TopTracks tracks={data.topTracks} />
          <RecentlyPlayed tracks={data.recentlyPlayed} />
        </div>

        {data.newReleases.length > 0 && (
          <NewReleases releases={data.newReleases} />
        )}

        <PlaylistGrid playlists={data.playlists} />
      </div>
    </div>
  );
}
