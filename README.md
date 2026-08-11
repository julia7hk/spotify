# Spotify Dashboard

self-built spotify dashboard app

Roadmap in [docs/milestones.md](docs/milestones.md)


## How to run

Flask API (5001)
```
source venv/bin/activate && python main.py
```

Next.js (3000)
```
npm run dev
```

<img width="804" height="952" alt="image" src="https://github.com/user-attachments/assets/c01dc4ad-a1d7-4d0b-9a51-902f047ee40c" />

## Stack

Next.js (App Router) + React + Tailwind frontend, Flask + Spotipy backend. The frontend proxies
`/api/*` to Flask (`next.config.ts` rewrites) so requests stay same-origin; all Spotify OAuth and
API calls live in the backend.


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


3. personal music player
    - studying music player
        - use it for when im studying that makes the lyrics or words quieter and enhances just the musical melody and beat → VOCAL SUPPRESSION
    - karaoke chorus player
