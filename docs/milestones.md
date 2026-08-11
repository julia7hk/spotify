# Spotify Vibe Recommender — Milestones

> **V0 core**: a custom recommender that beats Spotify's auto-mixes for
> **specific, multi-axis moods** (e.g. "fast/high-BPM/energizing focus music in a
> language I don't understand"). Every track carries **auto-generated + manual
> tags**; the user drives it by **seed songs + structured steer (chips/sliders)**,
> never a chat box. An **LLM acts only as a background tagger/ranker**, never a
> prompt surface. Full problem context + API constraints in [../CLAUDE.md](../CLAUDE.md).

## Milestone 0: What already exists (done)

- [x] Next.js 15 / React 19 frontend (`src/`) + Flask/Spotipy backend (`main.py`), OAuth via `SpotifyOAuth`
- [x] Working dashboard on the *survivor* endpoints (top artists/tracks, recently played, playlists, genre + mood analysis, listening stats)
- [x] Audited every route against the Nov 2024 + Feb 2026 API changes
- [x] Stripped 6 dead backend routes (`audio-features`, `recommendations`, `discover-artists`, `playlist/<id>/analysis`, `artist/<id>`, `new-releases`)
- [x] Cleaned matching frontend (`api.ts`, `page.tsx`, `types/spotify.ts`, deleted `NewReleases`/`DiscoverArtists` components) — typechecks clean

## Milestone 1: Unblock API Access (credentials + token persistence)

**Blocking everything else.** Feb 2026 Dev Mode rules require the app owner to hold a
Premium subscription, so the app must be registered under a Premium-owning developer account.

- [ ] Ensure the app is owned by a Premium developer account and configure its `SPOTIFY_CLIENT_ID` / `SPOTIFY_CLIENT_SECRET` in `.env`
- [ ] Add authorized accounts to the app's **User Management** allowlist (Dev Mode cap = 5 users)
- [ ] Replace `FlaskSessionCacheHandler` (token dies with the session cookie) with a **persistent token cache** — `CacheFileHandler(cache_path=...)` or a small DB/refresh-token row — so authorization survives restarts
- [ ] Confirm one-time authorization and that the token auto-refreshes indefinitely
- [ ] Re-probe the two unconfirmed survivor routes (`saved-tracks` → `GET /me/tracks`, `followed-artists` → `GET /me/following`); keep or rebuild based on live status codes

## Milestone 2: Track Storage + Library Ingestion

No database exists yet. Tagging + ranking need one. Personal single-user scope → **SQLite** is enough.

- [ ] **Decision:** SQLite (via `sqlite3`/SQLAlchemy) vs. flat JSON cache — default SQLite
- [ ] Schema: `track` table (spotify_id, name, artist, album, duration_ms, popularity, added_at)
- [ ] Schema: `tag` table (track_id, key, value, source: `auto`/`manual`/`llm`, confidence)
- [ ] Ingest the full liked-songs library (`GET /me/tracks`, paginated — was README goal #2) into `track`
- [ ] Ingest playlists the user curates as vibe examples (incl. the existing fast-paced seed playlist)
- [ ] Idempotent re-sync — re-running ingestion updates, never duplicates

## Milestone 3: Enrichment Pipeline (replace dead audio-features)

Spotify no longer gives BPM/energy/language. Source tags elsewhere. **Lean: Last.fm tags + LLM inference.**

### Data sources

- [ ] **Last.fm** integration — per-track `track.getTopTags` (crowd tags: `japanese`, `energetic`, `study`, `upbeat`) + `track.getSimilar` (candidate pool for M5)
- [ ] **Numeric fallback** (only if needed) — evaluate GetSongBPM / ReccoBeats / AcousticBrainz for actual BPM/energy numbers
- [ ] **MusicBrainz** (optional) — language / release-country field for the language axis

### Auto-tag normalization

- [ ] Map raw Last.fm tags → a controlled vibe vocabulary across axes: `tempo`, `energy`, `language`, `vocals` (present/instrumental/foreign), `mood`, `use_case`
- [ ] Cache enrichment per track (don't re-hit APIs); store into `tag` with `source=auto`
- [ ] Coverage report — % of library tagged per axis, so gaps are visible (no silent blanks)

## Milestone 4: LLM Tagging Layer (background labeler — NOT a chat box)

LLM fills axes that crowd tags miss (esp. **language** and rough **energy**) from artist + title.
Claude (`claude-opus-4-8`), structured output, no free-text user input. See [../CLAUDE.md](../CLAUDE.md) anti-chatbot rule.

- [ ] `.env` / `.env.example`: `ANTHROPIC_API_KEY`
- [ ] Thin `anthropic` client wrapper — schema-constrained (`messages.parse()`), retry/timeout handling
- [ ] Batch tagging job: for each track, infer `{language, energy, vocal_type, mood}` as structured tags → store with `source=llm`, with confidence
- [ ] **Validator** — reject hallucinated values (must be in the controlled vocabulary); low-confidence rows flagged, not trusted
- [ ] Precedence rule: `manual` > `llm` > `auto` when axes conflict
- [ ] Cache keyed on `(track_id, prompt_version)` — never re-tag unchanged tracks

## Milestone 5: Candidate Pool (replace dead recommendations)

Spotify's `/recommendations` is gone. Build the new-song pool from other sources + the tag index.

- [ ] Candidate generation from Last.fm `getSimilar` seeded on the user's vibe-matching tracks
- [ ] Enrich each candidate through the M3/M4 pipeline (so candidates carry the same tag axes)
- [ ] Resolve each candidate back to a Spotify track (`search` — note Dev Mode cap of 10 results/query) for playability
- [ ] Dedupe candidates against the existing library + already-suggested set

## Milestone 6: Vibe Query + Ranking Engine (seed + steer)

The core of the product: fuzzy multi-axis target → ranked playlist. **No new ML** — tag-distance scoring.

- [ ] Infer a target vibe vector from **seed songs'** aggregated tags (the "understand what I actually mean" step)
- [ ] Apply **explicit axis overrides** from the steer controls (e.g. `language ≠ Korean/English`, `min BPM 140`, `instrumental-leaning`) — this is the axis-decoupling that Spotify's mix can't do
- [ ] Score candidates by weighted tag-distance to the target; hard-filter on overridden axes
- [ ] Rank + return top-N with a per-track "why it matched" (which axes hit) for transparency
- [ ] `GET /api/vibe/recommend` — body: seed track ids + steer overrides; returns ranked tracks + match reasons
- [ ] Optional LLM re-rank pass (rephrases/orders the *already-scored* list; validator rejects any track not in the input — never invents songs)

## Milestone 7: Frontend — Seed + Steer UX (no chatbot)

Structured input → playlist output. No open text field, no conversational turns.

- [ ] Seed picker — select the 4–5 songs that nail the vibe (from library/search)
- [ ] Steer controls — chips/sliders per axis (tempo, energy, language include/exclude, instrumental-leaning, familiarity)
- [ ] Results view — ranked track list with per-track match reasons + play links
- [ ] Manual tag editor — add/override tags on any track (feeds `source=manual`, the highest-precedence source)
- [ ] Loading / empty / "not enough tagged tracks yet" states

## Milestone 8: Playlist Output

Turn a good result set into something the user actually listens to in Spotify.

- [ ] "Save as playlist" — create a Spotify playlist from the ranked results (`playlist-modify-private` scope; add scope to `main.py`)
- [ ] Name/describe the generated playlist (vibe summary + timestamp)
- [ ] Re-generate / refine — tweak steer controls and regenerate without losing the seed

## Milestone 9: Polish & Launch

- [ ] Enrichment/tagging as a background job with progress + "last tagged" timestamp
- [ ] Graceful degradation when Last.fm / LLM / Spotify is down (partial tags, deterministic fallback ranking)
- [ ] Rate-limit + cache guards on all external APIs (Last.fm, Anthropic, Spotify)
- [ ] Mobile-responsive audit
- [ ] Re-sync scheduling — pull new liked songs + re-tag on a cadence

## Backlog (separate PRs)

- [ ] Vocal-suppression "studying" player (README goal #3) — enhance melody/beat, quiet lyrics. Separate audio-DSP track, unrelated to the tag engine.
- [ ] Karaoke / chorus player (README goal #3).
- [ ] Confirm exact scope of the Feb 2026 library-endpoint consolidation (`/me/tracks`, `/me/following`) against live behavior once credentials work; rebuild `saved-tracks`/`followed-artists` if the reads moved to `/me/library`.
- [ ] Multi-vibe presets — save named steer configs ("urgent-focus", "late-night-chill") for one-click reuse.
- [ ] Extended Quota application — only if this ever needs >5 users (requires a registered business + 250k MAU; almost certainly never for a personal project).
