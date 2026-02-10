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

export interface DashboardData {
  profile: UserProfile;
  playlists: Playlist[];
  topArtists: TopArtist[];
  topTracks: TopTrack[];
  recentlyPlayed: RecentTrack[];
  listeningProfile: ListeningProfile | null;
}
