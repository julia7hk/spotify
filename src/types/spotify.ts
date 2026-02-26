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
  tracks: number;
}

export interface TopArtist {
  id: string;
  name: string;
  genres: string[];
  popularity: number;
  url: string;
  image: string | null;
}

export interface TopTrack {
  id: string;
  name: string;
  artist: string;
  album: string;
  url: string;
  image: string | null;
}

export interface RecentTrack {
  id: string;
  name: string;
  artist: string;
  album: string;
  played_at: string;
  url: string;
  image: string | null;
}

export interface PopularityTrack {
  id: string;
  name: string;
  artist: string;
  popularity: number;
  image: string | null;
  url: string;
  top_rank: number;
}

export interface ListeningProfile {
  top_genres: [string, number][];
  avg_popularity: number;
  avg_duration_min: number;
  explicit_ratio: number;
  release_years: string[];
  tracks_by_popularity: PopularityTrack[];
}

export interface SavedTrack {
  id: string;
  name: string;
  artist: string;
  album: string;
  added_at: string;
  url: string;
  image: string | null;
}

export interface NewRelease {
  id: string;
  name: string;
  artist: string;
  release_date: string;
  total_tracks: number;
  url: string;
  image: string | null;
}

export interface ListeningStats {
  [timeRange: string]: {
    top_artists: string[];
    top_tracks: { name: string; artist: string }[];
  };
}

export interface DiscoveredTrack {
  id: string;
  name: string;
  preview_url: string | null;
  url: string;
  image: string | null;
}

export interface DiscoveredArtist {
  id: string;
  name: string;
  genres: string[];
  popularity: number;
  url: string;
  image: string | null;
  similar_to: string;
  top_tracks: DiscoveredTrack[];
}

export interface MoodAnalysis {
  dominant_mood: string;
  mood_breakdown: Record<string, number>;
  mood_counts: Record<string, number>;
  genre_examples: Record<string, string[]>;
}

export interface GenreProfile {
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
  listeningProfile: ListeningProfile | null;
  newReleases: NewRelease[];
  listeningStats: ListeningStats | null;
  discoverArtists: DiscoveredArtist[];
  moodAnalysis: MoodAnalysis | null;
  genreProfile: GenreProfile | null;
}
