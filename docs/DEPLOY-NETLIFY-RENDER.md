# Full stack: Netlify (frontend) + Render (API + database)

Netlify only hosts static files. Login, files, and uploads need the **API** on Render (or another host) plus **S3-compatible storage** (e.g. Backblaze B2).

---

## Part A — API on Render (~15 min)

### 1. Run the blueprint (leave most fields blank)

1. [dashboard.render.com](https://dashboard.render.com) → **New** → **Blueprint**.
2. Connect your GitHub repo (same fork Netlify uses).
3. Render shows optional env vars (`FRONTEND_URL`, `B2_*`, …). **You can leave them all empty** for now and click **Apply**.
4. Render creates:
   - **yourdrive-db** (Postgres)
   - **yourdrive-api** (Node service)

Render assigns the API URL when the service is created — you do **not** need it before this step.

### 2. Copy the API URL (now it exists)

1. Open the **yourdrive-api** service in Render.
2. At the top you’ll see something like **`https://yourdrive-api.onrender.com`** (from the service name in `render.yaml`).
3. Test: `https://yourdrive-api.onrender.com/api/health` → `{"status":"OK"}`.

That URL is what you use in **Step 3 (Netlify)** as `NETLIFY_API_PROXY_URL`.

### 3. Set env vars on Render (second pass)

**yourdrive-api** → **Environment** → add only what you have ready:

| Variable | Required when | Value |
|----------|----------------|--------|
| `FRONTEND_URL` | Before login from Netlify | `https://your-site.netlify.app` |
| `B2_*` | Before file uploads | From Backblaze |
| `BACKEND_URL` | **Optional on Render** | Render sets `RENDER_EXTERNAL_URL` automatically |

**Save** → Render redeploys.

### 4. Backblaze B2 (storage — needed for uploads, not for login)

1. [backblaze.com/b2](https://www.backblaze.com/b2/cloud-storage.html) → create a bucket.
2. **Application keys** → create key with read/write on that bucket.
3. Paste values into Render env vars above.

Without B2, auth may work but **uploads will fail**.

### 5. Email (optional)

For verification emails, set `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM` on Render.

### Render build command (must match repo)

If deploy logs show an old command like `npm ci && npm run build:deploy...`, update it manually:

**yourdrive-api** → **Settings** → **Build & Deploy** → **Build Command**:

```bash
bash scripts/render-build.sh
```

Or use **Clear build cache & deploy** after syncing the latest `main`.

---

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
- [ ] B2 variables set on Render (for uploads)  
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
