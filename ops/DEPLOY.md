# Deploying to music.julia7hk.com

Hosts this dashboard on the same Oracle Cloud VM (`oc40`) as FalconUp, behind the
**existing** falconup nginx + Cloudflare. Model is identical to FalconUp: Docker
containers on the VM, one nginx reverse proxy, Cloudflare terminates TLS.

Result: you + up to 4 friends open `https://music.julia7hk.com` from any device
and log in with their own Spotify. (Spotify dev-mode cap is 5 accounts — permanent,
see `docs/milestones.md` Milestone 10.)

---

## 0. Prerequisites — two things only humans can do

**A. Your Premium friend (the app owner) must, in the Spotify app settings:**
- Add redirect URI **exactly**: `https://music.julia7hk.com/callback`
  (keep the existing `http://127.0.0.1:3000/callback` too, so local dev still works)
- Confirm all 5 Spotify **login emails** are under **User Management** (you + 4 friends).

**B. Cloudflare DNS (your account):**
- Add a record for `music` → the `oc40` VM's public IP (same target as `falconup`).
- **Proxied (orange cloud) ON** — that's what gives you HTTPS with no cert work.

Nothing below works until A is done (OAuth will 403 / "invalid redirect URI").

---

## 1. Get the code + secrets onto the VM

```bash
ssh oc40
git clone <this-repo> spotify   # or: cd spotify && git pull
cd spotify
```

Create `.env` on the VM (NOT committed) with production values:

```bash
cat > .env <<'EOF'
SPOTIFY_CLIENT_ID=<friend's client id>
SPOTIFY_CLIENT_SECRET=<friend's client secret>
SPOTIFY_REDIRECT_URI=https://music.julia7hk.com/callback
FRONTEND_URL=https://music.julia7hk.com
SECRET_KEY=<paste output of: openssl rand -hex 32>
SESSION_COOKIE_SECURE=true
TRUST_PROXY=true
FLASK_DEBUG=false
GROQ_API_KEY=<your groq key>
EOF
```

The app uses `load_dotenv(override=True)`, so this `.env` wins over anything in the
shell environment.

## 2. Create the shared network (once)

The falconup nginx reaches this app's containers over a shared docker network:

```bash
docker network create edge   # ok if it says "already exists"
```

## 3. Join the falconup nginx to that network

Quick (takes effect immediately):

```bash
docker network connect edge falconup-nginx
```

Permanent (survives a falconup redeploy) — in `falconup26/ops/compose.yaml`, add
`edge` to the nginx service and declare it external:

```yaml
  nginx:
    # ...
    networks:
      - falconup
      - edge
networks:
  falconup:
    driver: bridge
  edge:
    external: true
```

## 4. Install the nginx server block

The falconup nginx mounts `falconup26/ops/nginx/conf.d/` read-only, so drop the
block there and reload:

```bash
cp spotify/ops/nginx/music.conf falconup26/ops/nginx/conf.d/music.conf
docker exec falconup-nginx nginx -t     # sanity-check config
docker exec falconup-nginx nginx -s reload
```

> `music.conf` intentionally does NOT redefine the `map $http_upgrade ...` block —
> it reuses the one in `falconup.conf` (same nginx). If you ever remove
> falconup.conf, move that map into music.conf.

## 5. Build and start the app

```bash
cd spotify/ops
docker compose up -d --build
docker compose ps          # music-backend + music-frontend should be "running"
```

## 6. Verify

```bash
# from the VM: backend answers, and hands out the RIGHT client id + redirect uri
curl -s http://music-backend:5001/api/auth-url --resolve dummy || \
  docker exec music-backend curl -s localhost:5001/api/auth-url

# from anywhere: the public site loads
curl -I https://music.julia7hk.com
```

Then open **https://music.julia7hk.com** in a browser, log in with a whitelisted
Spotify account, and you should land on the dashboard.

---

## Updating later

```bash
cd spotify && git pull
cd ops && docker compose up -d --build
```

nginx changes: re-copy `music.conf` and `docker exec falconup-nginx nginx -s reload`.

## Troubleshooting

| Symptom | Cause / fix |
|---|---|
| `INVALID_CLIENT: Invalid redirect URI` | Step 0A not done, or URI mismatch. Must be exactly `https://music.julia7hk.com/callback`. |
| 403 "user may not be registered" | That Spotify account isn't in User Management (step 0A). |
| 403 "Active premium subscription required for the owner" | The app-owner account's Premium lapsed (or a few-hours propagation delay). |
| 502 from nginx | `music-backend`/`music-frontend` not on `edge`, or nginx not joined to `edge` (steps 2–3). Check `docker exec falconup-nginx ping music-backend`. |
| Login loops back to sign-in | Stale cookie in that browser — clear cookies for the domain, or use incognito. |
