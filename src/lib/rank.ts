import type { AlbumTrack, TopTrack } from "@/types/spotify";

/**
 * Cross-referencing album tracks against the user's top tracks.
 *
 * The hard part is that Spotify gives the *same song* a different track ID on
 * every release it appears on — the single, the album, the deluxe edition, a
 * compilation. So a strict ID join silently misses ranks that genuinely exist:
 * your top track came from the single, the panel is showing the album.
 *
 * The rule (owner's call): match on ID first, fall back to normalized
 * name + artist, and mark the fallback as `inferred` so the UI can say the
 * rank is a best guess rather than presenting it as exact.
 */

export interface RankMatch {
  rank: number;
  /** True when matched by title rather than by track ID. */
  inferred: boolean;
}

/**
 * Strip the things that differ between releases of one song:
 * "Mr. Brightside - Remastered 2011", "Aerodynamic (2021 Remaster)".
 * Deliberately conservative — it does not strip "(Live)" or "(Acoustic)",
 * which are genuinely different recordings and should not collide.
 */
function normalizeTitle(name: string): string {
  return name
    .toLowerCase()
    .replace(/\s*[-–—]\s*(\d{4}\s*)?(remaster|remastered).*$/i, "")
    .replace(/\s*\((\d{4}\s*)?(remaster|remastered)[^)]*\)/gi, "")
    .replace(/\s*[-–—]\s*single version$/i, "")
    .replace(/[^\p{L}\p{N}]+/gu, "")
    .trim();
}

function titleKey(name: string, artist: string): string {
  return `${normalizeTitle(name)}::${normalizeTitle(artist)}`;
}

export interface RankIndex {
  byId: Map<string, number>;
  byTitle: Map<string, number>;
}

/** Build once per top-tracks list, then look up each album track against it. */
export function buildRankIndex(topTracks: TopTrack[]): RankIndex {
  const byId = new Map<string, number>();
  const byTitle = new Map<string, number>();

  topTracks.forEach((track, index) => {
    const rank = index + 1;
    if (track.id) byId.set(track.id, rank);
    const key = titleKey(track.name, track.artist);
    // Keep the best rank if two releases of a song both chart.
    if (!byTitle.has(key)) byTitle.set(key, rank);
  });

  return { byId, byTitle };
}

export function lookupRank(
  index: RankIndex,
  track: Pick<AlbumTrack, "id" | "name" | "artist">
): RankMatch | null {
  const exact = index.byId.get(track.id);
  if (exact !== undefined) return { rank: exact, inferred: false };

  const byTitle = index.byTitle.get(titleKey(track.name, track.artist));
  if (byTitle !== undefined) return { rank: byTitle, inferred: true };

  return null;
}
