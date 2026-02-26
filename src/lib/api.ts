import type {
  UserProfile,
  Playlist,
  TopArtist,
  TopTrack,
  RecentTrack,
  ListeningProfile,
  DashboardData,
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
    newReleasesResult,
    listeningStatsResult,
  ] = await Promise.allSettled([
    getPlaylists(),
    getTopArtists(),
    getTopTracks(),
    getRecentlyPlayed(),
    getListeningProfile(),
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
    newReleases:
      newReleasesResult.status === "fulfilled" ? newReleasesResult.value : [],
    listeningStats:
      listeningStatsResult.status === "fulfilled" ? listeningStatsResult.value : null,
  };
}
