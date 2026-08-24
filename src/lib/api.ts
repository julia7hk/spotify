import type {
  UserProfile,
  Playlist,
  TopArtist,
  TopTrack,
  RecentTrack,
  SavedTracksResponse,
  ListeningProfile,
  DashboardData,
  ListeningStats,
  MoodAnalysis,
  GenreProfile,
  TimeRange,
} from "@/types/spotify";

const API_BASE = "";

async function fetchWithCredentials<T>(endpoint: string): Promise<T> {
  const res = await fetch(`${API_BASE}${endpoint}`);
  if (!res.ok) throw new Error(`${endpoint} failed: ${res.status}`);
  return res.json();
}

/** Append ?range= to endpoints that accept a time window. */
function withRange(path: string, range?: TimeRange): string {
  return range ? `${path}?range=${range}` : path;
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

export async function getTopArtists(range?: TimeRange): Promise<TopArtist[]> {
  const data = await fetchWithCredentials<{ top_artists: TopArtist[] }>(
    withRange("/api/top-artists", range)
  );
  return data.top_artists;
}

export async function getTopTracks(range?: TimeRange): Promise<TopTrack[]> {
  const data = await fetchWithCredentials<{ top_tracks: TopTrack[] }>(
    withRange("/api/top-tracks", range)
  );
  return data.top_tracks;
}

export async function getRecentlyPlayed(): Promise<RecentTrack[]> {
  const data = await fetchWithCredentials<{ recently_played: RecentTrack[] }>(
    "/api/recently-played"
  );
  return data.recently_played;
}

export async function getSavedTracks(): Promise<SavedTracksResponse> {
  return fetchWithCredentials<SavedTracksResponse>("/api/saved-tracks");
}

export async function getListeningProfile(
  range?: TimeRange
): Promise<ListeningProfile> {
  return fetchWithCredentials<ListeningProfile>(
    withRange("/api/listening-profile", range)
  );
}

export async function getListeningStats(): Promise<ListeningStats> {
  const data = await fetchWithCredentials<{ stats: ListeningStats }>(
    "/api/listening-stats"
  );
  return data.stats;
}

export async function getMoodAnalysis(range?: TimeRange): Promise<MoodAnalysis> {
  return fetchWithCredentials<MoodAnalysis>(
    withRange("/api/mood-analysis", range)
  );
}

export async function getGenreProfile(range?: TimeRange): Promise<GenreProfile> {
  return fetchWithCredentials<GenreProfile>(
    withRange("/api/genre-profile", range)
  );
}

function settled<T, F>(r: PromiseSettledResult<T>, fallback: F): T | F {
  return r.status === "fulfilled" ? r.value : fallback;
}

export async function fetchDashboardData(
  range: TimeRange = "medium_term"
): Promise<DashboardData | null> {
  const profile = await getCurrentUser();
  if (!profile) return null;

  const [
    playlists,
    topArtists,
    topTracks,
    recent,
    saved,
    listening,
    stats,
    mood,
    genre,
  ] = await Promise.allSettled([
    getPlaylists(),
    getTopArtists(range),
    getTopTracks(range),
    getRecentlyPlayed(),
    getSavedTracks(),
    getListeningProfile(range),
    getListeningStats(),
    getMoodAnalysis(range),
    getGenreProfile(range),
  ]);

  return {
    profile,
    playlists: settled(playlists, []),
    topArtists: settled(topArtists, []),
    topTracks: settled(topTracks, []),
    recentlyPlayed: settled(recent, []),
    savedTracks: settled(saved, null),
    listeningProfile: settled(listening, null),
    listeningStats: settled(stats, null),
    moodAnalysis: settled(mood, null),
    genreProfile: settled(genre, null),
  };
}
