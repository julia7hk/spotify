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

- [ ] Map raw Last.fm tags → a controlled vibe vocabulary across axes. **Mood/feeling + musical texture lead** (primary organizing axes for this user); activity is secondary. Axes: `mood`, `texture` (tempo/energy/acoustic-ness), `language`, `vocals` (present/instrumental/foreign), `use_case` (activity), and **`obscurity`** — how well-known the artist is (e.g. <500k listeners "niche" vs mainstream). Note: Spotify's `artist.popularity` (0-100) + `followers` survive the API cuts and approximate obscurity; true "monthly listeners" is not exposed, so derive from those.
- [ ] Cache enrichment per track (don't re-hit APIs); store into `tag` with `source=auto`
- [ ] Coverage report — % of library tagged per axis, so gaps are visible (no silent blanks)

## Milestone 4: LLM Tagging Layer (background labeler — NOT a chat box)

LLM fills axes that crowd tags miss (esp. **language** and rough **energy**) from artist + title.
Groq free tier (OpenAI-compatible; e.g. `llama-3.3-70b-versatile`), structured output, no free-text user input. See [../CLAUDE.md](../CLAUDE.md) anti-chatbot rule.

- [ ] `.env` / `.env.example`: `GROQ_API_KEY`
- [ ] Thin LLM client wrapper (OpenAI SDK pointed at Groq's base URL) — JSON/structured output, retry/timeout handling
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

## Milestone 5.5: Vibe Groups + Sessions (the primary input model)

Where vibe definitions come from. The user groups songs they think **cohere** (their real
listening habit: keep the autoplay picks that "vibe together" with the seed). Grouping is the
**training-data flywheel** the tag system needs — richer than a Spotify playlist (a flat bucket
with no "why") because a group carries an inferred profile + accept/reject history. Depends on
M2 (storage) and M6 (ranking); the group is what seeds M6.

- [ ] Schema: `vibe_group` (name, created_at, source: `manual`/`imported`) + `vibe_group_track` (group_id, track_id, role: `seed`/`accepted`/`rejected`/`skipped`)
- [ ] **Feedback weighting** — explicit `rejected` = strong negative; `skipped` = **weak** negative, only bites after repeated skips of *similar* tracks (a single skip may just be "not right now", not "wrong vibe"). `accepted` = positive.
- [ ] **Groups are a base vibe + variant sub-axes**, not a single point — e.g. "cozy" recurs but varies by `language` (Korean/English) and `obscurity` (niche vs mainstream) per session. Store the base profile; the variants are steer overrides applied at session time.
- [ ] **Import existing playlists as candidate vibe groups** — the cold-start bootstrap (the user's current system is "more and more playlists"; those are ready-made human-curated coherent sets). Pull each playlist's tracks → seed a group.
- [ ] **LLM coherence pass on import** — assess whether a playlist is one real vibe vs. a grab-bag (chronological dumps, "liked songs 2019", giant everything-lists). Coherent → good group; incoherent → offer to split into sub-vibes or keep as plain library. Playlist names + cross-playlist song overlap are free labels the LLM can read.
- [ ] **Static groups** — user explicitly adds/removes members; do NOT auto-absorb accepted suggestions (avoids silent pollution of the definition)
- [ ] Derive an **inferred axis profile** per group — aggregate member tags into the group's vibe vector (the shared dimensions: "these are all slow, English, indie-leaning")
- [ ] **Session** = open a group → run the M6 engine seeded on its profile → suggest more; keep/drop writes `accepted`/`rejected` rows back to the group
- [ ] **Tag cross-check** — surface when grouped tracks carry conflicting auto/LLM tags (signal the machine tags are wrong for this listener; feeds manual correction in M7)
- [ ] `POST /api/groups`, `POST /api/groups/{id}/tracks`, `GET /api/groups/{id}` (with profile), `POST /api/groups/{id}/session`

## Milestone 6: Vibe Query + Ranking Engine (seed + steer)

The core of the product: fuzzy multi-axis target → ranked playlist. **No new ML** — tag-distance scoring.

- [ ] Infer a target vibe vector from **seed songs / a vibe group's profile** (M5.5) — the "understand what I actually mean" step
- [ ] Apply **explicit axis overrides** from the steer controls (e.g. `language ≠ Korean/English`, `min BPM 140`, `instrumental-leaning`) — this is the axis-decoupling that Spotify's mix can't do
- [ ] Score candidates by weighted tag-distance to the target; hard-filter on overridden axes; exclude a group's wrong-vibe `rejected` tracks and their nearest neighbors **within the session**, but allow not-yet-familiar passes to re-surface across future sessions after cooldown (see growers rule below)
- [ ] **Novelty ratio dial** — per-session tunable known:unknown mix. A session ALWAYS injects some new tracks (pure-familiar isn't a session — the user would just hand-pick). Ratio varies wildly by mood: from ~all-new to one new track every ~10. Expose as a session control, not a fixed setting.
- [ ] **Growers — a pass is not a permanent reject.** Distinguish two negatives: **wrong-vibe reject** (song doesn't fit the axes → suppress it and neighbors) vs. **not-yet-familiar pass** (right vibe, hasn't clicked yet). The user's taste *grows with repeated exposure*: "if you recommended it again in another session and then another, I'd come to like it eventually." So a not-liked-yet track goes on a **cooldown, then re-surfaces in later sessions** — never a lifetime exclude. Track a per-track exposure count; only escalate to real suppression after **repeated passes of the same track** (mirrors the "repeated skips" rule for skips). Guard the flywheel: naive "reject = never show again" deletes exactly the songs the user would eventually love.
- [ ] **Vibe drift within a session — the target can walk.** The seed is a *starting anchor*, not a fixed vector: a real session migrated seed → adjacent → adjacent (e.g. *Reality* K-drama cover → the original OST version → slower, dreamy, deep **English** tracks). Support an evolving target that steps toward recently-accepted tracks as the session plays, instead of scoring every candidate against the frozen initial seed. Keep it bounded (don't let it wander off the base vibe). Steer overrides still pin whichever axes the user locked.
- [ ] **Known-set = the user's Liked Songs** — this user treats their auto-Liked-Songs playlist as a binary "have I heard this / would I recognize it" record. Use membership in Liked Songs to classify known vs. new for the novelty ratio. (Generalization caveat: most users don't maintain this; fall back to play-count / recently-played history as the "known" proxy.)
- [ ] Rank + return top-N with a per-track "why it matched" (which axes hit) for transparency
- [ ] `GET /api/vibe/recommend` — body: seed track ids **or group id** + steer overrides (incl. novelty ratio, obscurity range); returns ranked tracks + match reasons
- [ ] Optional LLM re-rank pass (rephrases/orders the *already-scored* list; validator rejects any track not in the input — never invents songs)

## Milestone 7: Frontend — Seed + Steer UX (no chatbot)

Structured input → playlist output. No open text field, no conversational turns.

- [ ] Seed picker — select the 4–5 songs that nail the vibe (from library/search)
- [ ] **Vibe group manager** (M5.5) — create/name a group, add/remove member songs, view its inferred axis profile
- [ ] **Session view** — open a group, see suggestions, keep/drop each (writes `accepted`/`rejected`); the autoplay-but-mine loop
- [ ] Steer controls — chips/sliders per axis (tempo, energy, language include/exclude, instrumental-leaning, familiarity), layered over the group's learned profile
- [ ] Results view — ranked track list with per-track match reasons + play links
- [ ] Manual tag editor — add/override tags on any track (feeds `source=manual`, the highest-precedence source); surface the M5.5 tag-conflict flags here
- [ ] Loading / empty / "not enough tagged tracks yet" states

## Milestone 8: Playlist Output

Turn a good result set into something the user actually listens to in Spotify.

- [ ] "Save as playlist" — create a Spotify playlist from the ranked results (`playlist-modify-private` scope; add scope to `main.py`)
- [ ] Name/describe the generated playlist (vibe summary + timestamp)
- [ ] Re-generate / refine — tweak steer controls and regenerate without losing the seed

## Milestone 9: Polish & Launch

- [ ] Enrichment/tagging as a background job with progress + "last tagged" timestamp
- [ ] Graceful degradation when Last.fm / LLM / Spotify is down (partial tags, deterministic fallback ranking)
- [ ] Rate-limit + cache guards on all external APIs (Last.fm, Groq, Spotify)
- [ ] Mobile-responsive audit
- [ ] Re-sync scheduling — pull new liked songs + re-tag on a cadence

## Concrete test cases (hold the engine to these)

Real motivating vibes to validate M6 against once it exists:

1. **Urgent-focus, foreign-language:** fast / high-BPM / energizing Japanese instrumental-leaning study music (language ≠ Korean/English so lyrics don't distract). Spotify's upbeat mix failed by serving generically-upbeat Korean songs.
2. **Dreamy-drift from an OST seed:** the app's seed is the **original *Reality* OST** (a real Spotify track) — the Ahn Hyo Seop cover that emotionally triggered it is a YouTube-only clip, NOT in the catalog, so the app never sees it and does NOT try to model the cover→OST leap (that happened in the user's head). From the OST seed, walk to slower-end, dreamy, **deep** English tracks. Tests **vibe drift** (target migrates off the seed) + partial acceptance (user likes only *some* of the dreamy-English pool) + growers (re-surfacing the passed-over ones later). **Design principle it establishes: seeds are Spotify-catalog only; out-of-catalog inspirations are not an input — their vibe payload collapses into the steer chips (`slower`, `dreamy`, `English`). Capturing the cover itself would need a free-text box (ruled out) or an optional one-shot session annotation the background LLM reads (backlog, not built).**

## Backlog (separate PRs)

- [ ] Vocal-suppression "studying" player (README goal #3) — enhance melody/beat, quiet lyrics. Separate audio-DSP track, unrelated to the tag engine.
- [ ] Karaoke / chorus player (README goal #3).
- [ ] Confirm exact scope of the Feb 2026 library-endpoint consolidation (`/me/tracks`, `/me/following`) against live behavior once credentials work; rebuild `saved-tracks`/`followed-artists` if the reads moved to `/me/library`.
- [ ] Multi-vibe presets — save named steer configs ("urgent-focus", "late-night-chill") for one-click reuse.
- [ ] **Optional out-of-catalog "inspiration" annotation** — a one-shot, non-conversational note on a session (e.g. "Ahn Hyo Seop's Reality cover") that the background LLM reads to infer extra steer, for cases where the trigger isn't a Spotify track and the user can't articulate the axis. Only build if steer chips prove insufficient; must NOT become a chat box.
- [ ] Extended Quota application — only if this ever needs >5 users (requires a registered business + 250k MAU; almost certainly never for a personal project).
