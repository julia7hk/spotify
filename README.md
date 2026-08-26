# Spotify Dashboard

self-built spotify dashboard app — live at [music.julia7hk.com](https://music.julia7hk.com)

Roadmap in [docs/milestones.md](docs/milestones.md) · deploy runbook in [docs/deploy.md](docs/deploy.md)


## How to run

Both processes run together. Python deps are managed with [uv](https://docs.astral.sh/uv/)
(`uv sync` to install).

Flask API (5001)
```
uv run python main.py
```

Next.js (3000)
```
npm run dev
```

Copy `.env.example` to `.env` and fill in your Spotify app credentials first —
the backend reads them at import time and won't start without them.

## Checks

```
uv run pytest -q      # backend normalizer tests
npx tsc --noEmit      # typecheck
npm run build         # production build (typechecks too)
```

All three run in CI on every PR. `npm run lint` is not configured — use `tsc` + `build`.

<img width="804" height="952" alt="image" src="https://github.com/user-attachments/assets/c01dc4ad-a1d7-4d0b-9a51-902f047ee40c" />

## Stack

Next.js (App Router) + React + Tailwind frontend, Flask + Spotipy backend. The frontend proxies
`/api/*` to Flask (`next.config.ts` rewrites) so requests stay same-origin; all Spotify OAuth and
API calls live in the backend.

Deployed as two Docker images built by GitHub Actions, running on an Oracle Cloud VM behind a
shared nginx + Cloudflare. CI builds and publishes on every push to `main`; deploying is a
deliberate manual step.


## Project Goals

1. spotify dashboard
    - displays all the music stats im interested in
    - goal is to get used to using an api and creating a frontend site
    - alternatives
        - spotify weekly listening stats
            - top 5 artists + songs per week
            - + random insights about your listening
        - https://www.statsforspotify.com/
            - top 50 songs + artists per 4 weeks, 1/2 year, 1 year
                - automatically turns list into playlist for me
            - top ?? genres
            - **timestamped songs i listened to https://www.statsforspotify.com/track/recent**
        - https://volt.fm/user/kripvdtwxaiah7vw
            - top songs, artists, albums, genres
            - **Taste, obscure/average/popular**
        - [Receiptify https://receiptify.herokuapp.com](https://receiptify.herokuapp.com/)
        
        
2. categorize all my spotify liked songs with ml
    - where do i get data for all my songs? spotify would be nice
        - bpm
        - genre
        - artist
    - **update:** spotify killed this route. `/audio-features` (bpm, energy, valence)
      and `/recommendations` were deprecated Nov 2024, and artist `genres` were
      dropped from the API entirely in Aug 2026. the plan is now last.fm crowd tags
      + llm inference instead — see milestones M3/M4.


3. personal music player
    - studying music player
        - use it for when im studying that makes the lyrics or words quieter and enhances just the musical melody and beat → VOCAL SUPPRESSION
    - karaoke chorus player
