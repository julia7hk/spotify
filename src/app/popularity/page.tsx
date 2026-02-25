"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import type { ListeningProfile, PopularityTrack } from "@/types/spotify";
import { getListeningProfile } from "@/lib/api";

function TrackCard({ track, rank }: { track: PopularityTrack; rank: number }) {
  return (
    <a
      href={track.url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-4 p-3 bg-[#6E7482] hover:bg-[#7E8492] rounded-lg transition-colors"
    >
      <span className="text-[#AED9E0] text-sm w-6 text-right font-mono">
        {rank}
      </span>
      <div className="relative w-12 h-12 flex-shrink-0">
        {track.image ? (
          <Image
            src={track.image}
            alt={track.name}
            fill
            sizes="48px"
            className="object-cover rounded"
          />
        ) : (
          <div className="w-full h-full bg-[#494e5a] rounded flex items-center justify-center">
            <svg
              className="w-6 h-6 text-[#AED9E0]"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
            </svg>
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium truncate">{track.name}</p>
        <p className="text-sm text-[#AED9E0] truncate">{track.artist}</p>
      </div>
      <div className="text-right">
        <p className="text-2xl font-bold">{track.popularity}</p>
        <p className="text-xs text-[#AED9E0]">popularity</p>
      </div>
    </a>
  );
}

export default function PopularityPage() {
  const [profile, setProfile] = useState<ListeningProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const data = await getListeningProfile();
        setProfile(data);
      } catch {
        setError("Failed to load popularity data");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#FFA69E]"></div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <p className="text-[#AED9E0]">{error || "No data available"}</p>
        <Link href="/" className="text-[#FFA69E] hover:underline">
          Back to Dashboard
        </Link>
      </div>
    );
  }

  const tracks = profile.tracks_by_popularity || [];
  const mostPopular = tracks.slice(0, 5);
  const leastPopular = [...tracks].reverse().slice(0, 5);

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-[#AED9E0] hover:text-white mb-8 transition-colors"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Back to Dashboard
        </Link>

        <h1 className="text-4xl font-bold mb-2">Popularity Analysis</h1>
        <p className="text-[#AED9E0] mb-8">
          Based on your top {tracks.length} tracks
        </p>

        <div className="bg-[#6E7482] rounded-xl p-8 mb-10 text-center">
          <p className="text-[#AED9E0] text-sm mb-2">Average Popularity</p>
          <p className="text-6xl font-bold mb-2">{profile.avg_popularity}</p>
          <p className="text-[#AED9E0]">out of 100</p>
          <div className="mt-4 h-3 bg-[#494e5a] rounded-full overflow-hidden max-w-md mx-auto">
            <div
              className="h-full bg-[#FFA69E] rounded-full transition-all duration-500"
              style={{ width: `${profile.avg_popularity}%` }}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <section>
            <h2 className="text-2xl font-bold mb-4">Most Popular</h2>
            <p className="text-[#AED9E0] text-sm mb-4">
              Your mainstream favorites
            </p>
            <div className="space-y-3">
              {mostPopular.map((track, idx) => (
                <TrackCard key={track.id} track={track} rank={idx + 1} />
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">Least Popular</h2>
            <p className="text-[#AED9E0] text-sm mb-4">Your hidden gems</p>
            <div className="space-y-3">
              {leastPopular.map((track, idx) => (
                <TrackCard key={track.id} track={track} rank={idx + 1} />
              ))}
            </div>
          </section>
        </div>

        <section className="mt-12">
          <h2 className="text-2xl font-bold mb-4">All Tracks</h2>
          <p className="text-[#AED9E0] text-sm mb-6">
            All {tracks.length} tracks used in calculating your average popularity
          </p>
          <div className="bg-[#6E7482] rounded-xl overflow-hidden">
            <div className="grid grid-cols-[auto_1fr_auto] gap-4 px-4 py-3 border-b border-[#494e5a] text-[#AED9E0] text-sm font-medium">
              <span className="w-8 text-right">#</span>
              <span>Track</span>
              <span className="w-20 text-right">Popularity</span>
            </div>
            {tracks.map((track, idx) => (
              <a
                key={track.id}
                href={track.url}
                target="_blank"
                rel="noopener noreferrer"
                className="grid grid-cols-[auto_1fr_auto] gap-4 px-4 py-3 hover:bg-[#7E8492] transition-colors items-center"
              >
                <span className="text-[#AED9E0] text-sm w-8 text-right font-mono">
                  {idx + 1}
                </span>
                <div className="flex items-center gap-3 min-w-0">
                  <div className="relative w-10 h-10 flex-shrink-0">
                    {track.image ? (
                      <Image
                        src={track.image}
                        alt={track.name}
                        fill
                        sizes="40px"
                        className="object-cover rounded"
                      />
                    ) : (
                      <div className="w-full h-full bg-[#494e5a] rounded flex items-center justify-center">
                        <svg
                          className="w-5 h-5 text-[#AED9E0]"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
                        </svg>
                      </div>
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium truncate">{track.name}</p>
                    <p className="text-sm text-[#AED9E0] truncate">{track.artist}</p>
                  </div>
                </div>
                <div className="w-20 text-right">
                  <span className="inline-flex items-center justify-center w-12 h-8 bg-[#494e5a] rounded-full font-bold text-sm">
                    {track.popularity}
                  </span>
                </div>
              </a>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
