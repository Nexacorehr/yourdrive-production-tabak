# Full stack: Netlify (frontend) + Render (API + database)

Netlify only hosts static files. Login, files, and uploads need the **API** on Render (or another host) plus **S3-compatible storage** (e.g. Backblaze B2).

---

## Part A — API on Render (~15 min)

### 1. Create the backend

1. [dashboard.render.com](https://dashboard.render.com) → **New** → **Blueprint**.
2. Connect the **same GitHub repo** (or fork) as Netlify.
3. Apply the blueprint (`render.yaml` creates **yourdrive-db** + **yourdrive-api**).
4. Wait until the API deploy finishes (first build runs Prisma migrations).

### 2. Copy the API URL

Open the **yourdrive-api** service → copy the public URL, e.g. `https://yourdrive-api.onrender.com`.

Test: open `https://YOUR-API.onrender.com/api/health` — should return `{"status":"OK"}`.

### 3. Required environment variables (Render → yourdrive-api → Environment)

| Variable | Example | Notes |
|----------|---------|--------|
| `FRONTEND_URL` | `https://your-site.netlify.app` | Your Netlify URL, no trailing slash |
| `BACKEND_URL` | `https://yourdrive-api.onrender.com` | Same as Render service URL |
| `B2_KEY_ID` | from Backblaze | S3-compatible storage |
| `B2_APPLICATION_KEY` | from Backblaze | |
| `B2_BUCKET_NAME` | your bucket | |
| `B2_ENDPOINT` | `https://s3…backblazeb2.com` | |
| `B2_REGION` | e.g. `eu-central-003` | |
| `B2_PUBLIC_URL` | public bucket URL if used | optional for avatars |

`DATABASE_URL`, `JWT_ACCESS_SECRET`, and `JWT_REFRESH_SECRET` are set by the blueprint.

**Save** → Render redeploys the API.

### 4. Backblaze B2 (storage)

1. [backblaze.com/b2](https://www.backblaze.com/b2/cloud-storage.html) → create a bucket.
2. **Application keys** → create key with read/write on that bucket.
3. Paste values into Render env vars above.

Without B2, auth may work but **uploads will fail**.

### 5. Email (optional)

For verification emails, set `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM` on Render.

---

## Part B — Connect Netlify to the API (~2 min)

1. Netlify → your site → **Site configuration** → **Environment variables**.
2. Add:

   | Key | Value |
   |-----|--------|
   | `NETLIFY_API_PROXY_URL` | `https://yourdrive-api.onrender.com` (your Render URL, **no** `/api`, no trailing slash) |
   | `VITE_PUBLIC_SITE_URL` | `https://your-site.netlify.app` |

3. **Deploys** → **Trigger deploy** → **Deploy site**.

The build runs `scripts/prepare-netlify.mjs`, which proxies `/api/*` to Render so the app keeps using same-origin `/api` (no extra frontend config).

---

## Part C — Sync your fork

If Netlify builds from a fork, **Sync fork** on GitHub so it has `render.yaml`, `scripts/prepare-netlify.mjs`, and the latest `netlify.toml`.

---

## Checklist

- [ ] `https://YOUR-API.onrender.com/api/health` → OK  
- [ ] Render `FRONTEND_URL` = Netlify URL  
- [ ] Render `BACKEND_URL` = Render API URL  
- [ ] B2 variables set on Render  
- [ ] Netlify `NETLIFY_API_PROXY_URL` = Render URL (no `/api`)  
- [ ] Netlify redeployed after setting env vars  
- [ ] Register / login on the Netlify site works  

---

## Troubleshooting

| Symptom | Fix |
|---------|-----|
| Network 404 on `/api/...` | Set `NETLIFY_API_PROXY_URL` and redeploy Netlify |
| CORS errors | Set `FRONTEND_URL` on Render to exact Netlify URL (https, no slash) |
| Render service sleeps (free tier) | First request after idle takes ~30s — wait and retry |
| Upload fails | Check B2 env vars and bucket permissions |
| API build failed on Render | Open deploy logs; ensure `npm ci` and Prisma migrate succeed |

---

## OAuth (optional)

Set Google/GitHub OAuth callback URLs to your **Render** `BACKEND_URL` paths, e.g.  
`https://yourdrive-api.onrender.com/api/auth/oauth/google/callback`  
(confirm exact paths in `apps/api/src/config/passport.config.ts`).
