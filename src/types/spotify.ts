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

export interface ListeningProfile {
  top_genres: [string, number][];
  avg_popularity: number;
  avg_duration_min: number;
  explicit_ratio: number;
  release_years: string[];
}

export interface AudioFeatures {
  track_count: number;
  averages: {
    danceability: number;
    energy: number;
    valence: number;
    acousticness: number;
    instrumentalness: number;
    speechiness: number;
    tempo: number;
    loudness: number;
  };
}

export interface MoodAnalysis {
  dominant_mood: string;
  mood_breakdown: Record<string, number>;
  mood_counts: Record<string, number>;
}

export interface Recommendation {
  id: string;
  name: string;
  artist: string;
  album: string;
  preview_url: string | null;
  url: string;
  image: string | null;
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

export interface DashboardData {
  profile: UserProfile;
  playlists: Playlist[];
  topArtists: TopArtist[];
  topTracks: TopTrack[];
  recentlyPlayed: RecentTrack[];
  listeningProfile: ListeningProfile | null;
  audioFeatures: AudioFeatures | null;
  moodAnalysis: MoodAnalysis | null;
  recommendations: Recommendation[];
  newReleases: NewRelease[];
  listeningStats: ListeningStats | null;
}
