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

        {data.listeningProfile && (
          <TopGenres genres={data.listeningProfile.top_genres} />
        )}

        <TopArtists artists={data.topArtists} />

        <TopTracks tracks={data.topTracks} />

        <RecentlyPlayed tracks={data.recentlyPlayed} />

        <PlaylistGrid playlists={data.playlists} />
      </div>
    </div>
  );
}
