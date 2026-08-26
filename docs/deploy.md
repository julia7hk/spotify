# Deploying to music.julia7hk.com

Hosts this dashboard on the same Oracle Cloud VM (`oc40`) as FalconUp, behind the
shared **edge-proxy** stack + Cloudflare. Model is identical to FalconUp: Docker
containers on the VM, one shared nginx reverse proxy, Cloudflare terminates TLS.

Images are built by GitHub Actions and pulled from ghcr — **the VM compiles
nothing**. Deploy is a deliberate manual step (`docker compose pull && up -d`);
CI stops after publishing images and prints the exact commands in its run
summary.

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

## 3. Install the nginx server block in edge-proxy

`edge-proxy` (`~/_proj/edge-proxy`) is the standalone stack that owns :80 and
routes by hostname for every app on the VM. It mounts its own `conf.d/`
read-only, so drop the block there and reload:

```bash
cp spotify/ops/nginx/music.conf ~/_proj/edge-proxy/conf.d/music.conf
docker exec edge-nginx nginx -t     # sanity-check config
docker exec edge-nginx nginx -s reload
```

> Historical note: music used to be proxied by the *falconup* nginx, joined to
> `edge` by a runtime-only `docker network connect` that did not survive a
> falconup redeploy. That coupling is gone — falconup and music are both
> nginx-less backend stacks now, and neither can knock the other offline.

> `music.conf` does NOT define the `map $http_upgrade ...` block — edge-proxy's
> shared config owns it (nginx errors on a duplicate map).

## 4. Pull and start the app

```bash
cd spotify/ops
docker compose pull
docker compose up -d
docker compose ps          # music-backend + music-frontend should be "running"
```

If ghcr is unreachable, or you need to run un-pushed local changes, build from
source instead:

```bash
docker compose -f compose.build.yaml up -d --build
```

## 5. Verify

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

## Updating later (the normal deploy)

Push to `main`. GitHub Actions runs the tests, builds both images and pushes them
to ghcr tagged `:latest` and `:<commit-sha>`; the run summary prints these same
commands. Then:

```bash
ssh oc40
cd ~/_proj/spotify/ops
docker compose pull && docker compose up -d
```

No `git pull` needed for a code change — the image carries the code. You only
need to pull the repo when a *compose* or *nginx* file changed.

### Rolling back

Every CI run publishes a `:<commit-sha>` tag, so rollback needs no rebuild and no
git checkout:

```bash
MUSIC_TAG=<known-good-sha> docker compose up -d
```

Verify, then either leave it pinned or revert the bad commit on `main` and
redeploy `:latest`.

nginx changes: re-copy `music.conf` and `docker exec edge-nginx nginx -s reload`.

## Troubleshooting

| Symptom | Cause / fix |
|---|---|
| `INVALID_CLIENT: Invalid redirect URI` | Step 0A not done, or URI mismatch. Must be exactly `https://music.julia7hk.com/callback`. |
| 403 "user may not be registered" | That Spotify account isn't in User Management (step 0A). |
| 403 "Active premium subscription required for the owner" | The app-owner account's Premium lapsed (or a few-hours propagation delay). |
| 502 from nginx | `music-backend`/`music-frontend` not on `edge`, or edge-proxy not running. Check `docker exec edge-nginx ping music-backend`. |
| `no matching manifest for linux/arm64/v8` | The published image is amd64-only but oc40 is arm64. CI builds the images on `ubuntu-24.04-arm` for this reason — if that was changed, change it back. Stopgap: `docker compose -f compose.build.yaml up -d --build`. |
| `pull access denied` / images named `music-backend` | The VM's checkout predates the ghcr `compose.yaml`. `git pull` in `~/_proj/spotify` first. |
| `manifest unknown` on `docker compose pull` | CI hasn't published yet (check the Actions run), or the ghcr package is private — make it public, or `docker login ghcr.io` on the VM with a read-only PAT. |
| Deployed but the site looks unchanged | Cloudflare cached the HTML (`s-maxage`). Hard-reload, or purge the domain's cache. |
| Login loops back to sign-in | Stale cookie in that browser — clear cookies for the domain, or use incognito. |
