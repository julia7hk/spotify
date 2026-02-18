# how to run
Flask API (5001)
```
source venv/bin/activate && python main.py
```

Next.js (3000)
```
npm run dev
```


<img width="804" height="952" alt="image" src="https://github.com/user-attachments/assets/c01dc4ad-a1d7-4d0b-9a51-902f047ee40c" />



# Project Goals

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

---

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
