"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

interface Playlist {
  id: string;
  name: string;
  url: string;
  image: string | null;
  tracks: number;
}

interface User {
  name: string;
  image: string | null;
}

interface PlaylistData {
  authenticated: boolean;
  user: User;
  playlists: Playlist[];
}

const API_BASE = "http://127.0.0.1:5001";

export default function Home() {
  const [data, setData] = useState<PlaylistData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPlaylists();
  }, []);

  const fetchPlaylists = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/playlists`, {
        credentials: "include",
      });
      if (res.ok) {
        const json = await res.json();
        setData(json);
      } else {
        setData(null);
      }
    } catch {
      setData(null);
    }
    setLoading(false);
  };

  const handleLogin = async () => {
    const res = await fetch(`${API_BASE}/api/auth-url`);
    const { url } = await res.json();
    window.location.href = url;
  };

  const handleLogout = async () => {
    window.location.href = `${API_BASE}/logout`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#1DB954] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!data?.authenticated) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-8 p-8">
        <div className="text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <svg className="w-12 h-12 text-[#1DB954]" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
            </svg>
            <h1 className="text-4xl font-bold">Spotify Playlists</h1>
          </div>
          <p className="text-[#b3b3b3] text-lg">View and manage your playlists</p>
        </div>
        <button
          onClick={handleLogin}
          className="flex items-center gap-3 bg-[#1DB954] hover:bg-[#1ed760] text-black font-semibold py-4 px-8 rounded-full transition-all hover:scale-105"
        >
          <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
          </svg>
          Connect with Spotify
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <header className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-4">
            {data.user.image ? (
              <Image
                src={data.user.image}
                alt={data.user.name}
                width={48}
                height={48}
                className="w-12 h-12 rounded-full object-cover"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-[#282828] flex items-center justify-center">
                <span className="text-xl font-bold">{data.user.name?.[0]}</span>
              </div>
            )}
            <div>
              <p className="text-[#b3b3b3] text-sm">Welcome back</p>
              <h2 className="text-xl font-bold">{data.user.name}</h2>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="text-[#b3b3b3] hover:text-white transition-colors text-sm font-medium"
          >
            Logout
          </button>
        </header>

        {/* Title */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Your Playlists</h1>
          <p className="text-[#b3b3b3]">{data.playlists.length} playlists</p>
        </div>

        {/* Playlists Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {data.playlists.map((playlist) => (
            <a
              key={playlist.id}
              href={playlist.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group bg-[#181818] hover:bg-[#282828] rounded-lg p-4 transition-all"
            >
              <div className="relative mb-4 aspect-square">
                {playlist.image ? (
                  <Image
                    src={playlist.image}
                    alt={playlist.name}
                    fill
                    sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
                    className="object-cover rounded-md shadow-lg"
                  />
                ) : (
                  <div className="w-full h-full bg-[#282828] rounded-md flex items-center justify-center">
                    <svg className="w-16 h-16 text-[#b3b3b3]" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
                    </svg>
                  </div>
                )}
                {/* Play button on hover */}
                <button className="absolute bottom-2 right-2 w-12 h-12 bg-[#1DB954] rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all shadow-xl">
                  <svg className="w-5 h-5 text-black ml-1" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z"/>
                  </svg>
                </button>
              </div>
              <h3 className="font-semibold truncate mb-1">{playlist.name}</h3>
              <p className="text-sm text-[#b3b3b3]">{playlist.tracks} tracks</p>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
