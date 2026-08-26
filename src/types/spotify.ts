/** Spotify's three top-item windows. Was hardcoded to medium_term everywhere. */
export type TimeRange = "short_term" | "medium_term" | "long_term";

export const TIME_RANGES: { value: TimeRange; label: string; short: string }[] = [
  { value: "short_term", label: "Last 4 weeks", short: "4 weeks" },
  { value: "medium_term", label: "Last 6 months", short: "6 months" },
  { value: "long_term", label: "All time", short: "All time" },
];

export interface UserProfile {
  id: string;
  name: string;
  image: string | null;
  followers: number;
}

export interface Playlist {
  id: string;
  name: string;
  url: string;
  image: string | null;
  /** null since Aug 2026 — Spotify dropped tracks.total from simplified playlists. */
  tracks: number | null;
}

export interface TopArtist {
  id: string;
  name: string;
  /** Empty until Last.fm enrichment lands — Spotify no longer serves genres. */
  genres: string[];
  /** null since Aug 2026. */
  popularity: number | null;
  /** null since Aug 2026. */
  followers: number | null;
  url: string;
  image: string | null;
}

export interface TopTrack {
  id: string;
  name: string;
  artist: string;
  album: string;
  /** Drives the album panel — null for local files with no album. */
  album_id: string | null;
  /** null since Aug 2026. */
  popularity: number | null;
  duration_ms: number | null;
  explicit: boolean;
  release_date: string | null;
  url: string;
  image: string | null;
}

/**
 * A track as it appears in an album's own track list. Simplified: no album
 * sub-object, so cover art comes from the parent `Album`, and no popularity.
 */
export interface AlbumTrack {
  id: string;
  name: string;
  artist: string;
  artists: string[];
  track_number: number | null;
  disc_number: number;
  duration_ms: number | null;
  explicit: boolean;
  url: string;
}

export interface Album {
  id: string;
  name: string;
  artist: string;
  artists: string[];
  release_date: string | null;
  total_tracks: number | null;
  url: string;
  image: string | null;
  tracks: AlbumTrack[];
}

export interface RecentTrack extends TopTrack {
  played_at: string;
}

export interface SavedTrack extends TopTrack {
  added_at: string;
}

export interface MonthBucket {
  month: string;
  count: number;
}

export interface SavedTracksResponse {
  total: number;
  tracks: SavedTrack[];
  added_by_month: MonthBucket[];
}

export interface ListeningProfile {
  range: TimeRange;
  genres_available: boolean;
  top_genres: [string, number][];
  avg_duration_min: number | null;
  explicit_ratio: number | null;
  release_years: string[];
}

export interface ListeningStats {
  [timeRangeLabel: string]: {
    range: TimeRange;
    top_artists: TopArtist[];
    top_tracks: TopTrack[];
  };
}

export interface MoodAnalysis {
  genres_available: boolean;
  dominant_mood: string | null;
  mood_breakdown: Record<string, number>;
  mood_counts: Record<string, number>;
  genre_examples: Record<string, string[]>;
}

export interface GenreProfile {
  genres_available: boolean;
  genres: { name: string; count: number }[];
  unique_genres: number;
  diversity_score: number;
  top_genre: string | null;
}

export interface DashboardData {
  profile: UserProfile;
  playlists: Playlist[];
  topArtists: TopArtist[];
  topTracks: TopTrack[];
  recentlyPlayed: RecentTrack[];
  savedTracks: SavedTracksResponse | null;
  listeningProfile: ListeningProfile | null;
  listeningStats: ListeningStats | null;
  moodAnalysis: MoodAnalysis | null;
  genreProfile: GenreProfile | null;
}
