import type {
  UserProfile,
  Playlist,
  TopArtist,
  TopTrack,
  RecentTrack,
  ListeningProfile,
  DashboardData,
  AudioFeatures,
  MoodAnalysis,
  Recommendation,
  NewRelease,
  ListeningStats,
} from "@/types/spotify";

const API_BASE = "";

async function fetchWithCredentials<T>(endpoint: string): Promise<T> {
  const res = await fetch(`${API_BASE}${endpoint}`);
  if (!res.ok) throw new Error(`${endpoint} failed: ${res.status}`);
  return res.json();
}

export async function getAuthUrl(): Promise<string> {
  const res = await fetch(`${API_BASE}/api/auth-url`);
  const { url } = await res.json();
  return url;
}

export async function getCurrentUser(): Promise<UserProfile | null> {
  const res = await fetch(`${API_BASE}/api/me`);
  if (!res.ok) return null;
  return res.json();
}

export async function getPlaylists(): Promise<Playlist[]> {
  const data = await fetchWithCredentials<{ playlists: Playlist[] }>(
    "/api/playlists"
  );
  return data.playlists;
}

export async function getTopArtists(): Promise<TopArtist[]> {
  const data = await fetchWithCredentials<{ top_artists: TopArtist[] }>(
    "/api/top-artists"
  );
  return data.top_artists;
}

export async function getTopTracks(): Promise<TopTrack[]> {
  const data = await fetchWithCredentials<{ top_tracks: TopTrack[] }>(
    "/api/top-tracks"
  );
  return data.top_tracks;
}

export async function getRecentlyPlayed(): Promise<RecentTrack[]> {
  const data = await fetchWithCredentials<{ recently_played: RecentTrack[] }>(
    "/api/recently-played"
  );
  return data.recently_played;
}

export async function getListeningProfile(): Promise<ListeningProfile> {
  return fetchWithCredentials<ListeningProfile>("/api/listening-profile");
}

export async function getAudioFeatures(): Promise<AudioFeatures> {
  return fetchWithCredentials<AudioFeatures>("/api/audio-features");
}

export async function getMoodAnalysis(): Promise<MoodAnalysis> {
  return fetchWithCredentials<MoodAnalysis>("/api/mood-analysis");
}

export async function getRecommendations(): Promise<Recommendation[]> {
  const data = await fetchWithCredentials<{ recommendations: Recommendation[] }>(
    "/api/recommendations"
  );
  return data.recommendations;
}

export async function getNewReleases(): Promise<NewRelease[]> {
  const data = await fetchWithCredentials<{ albums: NewRelease[] }>(
    "/api/new-releases"
  );
  return data.albums;
}

export async function getListeningStats(): Promise<ListeningStats> {
  const data = await fetchWithCredentials<{ stats: ListeningStats }>(
    "/api/listening-stats"
  );
  return data.stats;
}

export async function fetchDashboardData(): Promise<DashboardData | null> {
  const profile = await getCurrentUser();
  if (!profile) return null;

  const [
    playlistsResult,
    topArtistsResult,
    topTracksResult,
    recentResult,
    listeningResult,
    audioFeaturesResult,
    moodResult,
    recommendationsResult,
    newReleasesResult,
    listeningStatsResult,
  ] = await Promise.allSettled([
    getPlaylists(),
    getTopArtists(),
    getTopTracks(),
    getRecentlyPlayed(),
    getListeningProfile(),
    getAudioFeatures(),
    getMoodAnalysis(),
    getRecommendations(),
    getNewReleases(),
    getListeningStats(),
  ]);

  return {
    profile,
    playlists:
      playlistsResult.status === "fulfilled" ? playlistsResult.value : [],
    topArtists:
      topArtistsResult.status === "fulfilled" ? topArtistsResult.value : [],
    topTracks:
      topTracksResult.status === "fulfilled" ? topTracksResult.value : [],
    recentlyPlayed:
      recentResult.status === "fulfilled" ? recentResult.value : [],
    listeningProfile:
      listeningResult.status === "fulfilled" ? listeningResult.value : null,
    audioFeatures:
      audioFeaturesResult.status === "fulfilled" ? audioFeaturesResult.value : null,
    moodAnalysis:
      moodResult.status === "fulfilled" ? moodResult.value : null,
    recommendations:
      recommendationsResult.status === "fulfilled" ? recommendationsResult.value : [],
    newReleases:
      newReleasesResult.status === "fulfilled" ? newReleasesResult.value : [],
    listeningStats:
      listeningStatsResult.status === "fulfilled" ? listeningStatsResult.value : null,
  };
}
