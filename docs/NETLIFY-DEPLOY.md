# Deploy YourDrive frontend on Netlify (≈10 minutes)

This repo includes `netlify.toml` so Netlify knows how to build and publish **`apps/web`** only.

**What works after deploy:** landing page, pricing, about, help, and other public marketing pages.

**What does not work without a separate API server:** sign-in, register, dashboard, file upload. The backend (`apps/api`) must run elsewhere (your PC, a VPS, Railway, etc.). See [Optional: connect an API](#optional-connect-an-api) at the end.

---

## Before you start

- A [GitHub](https://github.com) account
- A [Netlify](https://www.netlify.com) account (free tier is enough)

---

## Step 1 — Put the code on GitHub

**If this project is already your repo on GitHub**, push the latest code (including `netlify.toml`):

```bash
cd /path/to/yourdrive-1
git add netlify.toml apps/web/public/_redirects docs/NETLIFY-DEPLOY.md
git commit -m "Add Netlify deploy config"
git push
```

**If you need a fork** (code lives under someone else’s account):

1. Open the original repo on GitHub.
2. Click **Fork** → **Create fork**.
3. Clone **your** fork:

   ```bash
   git clone https://github.com/YOUR_USERNAME/yourdrive-1.git
   cd yourdrive-1
   ```

4. If `netlify.toml` is missing on your fork, copy it from the upstream repo or pull the branch that contains it, then push to **your** fork.

---

## Step 2 — Sign in to Netlify

1. Go to [https://app.netlify.com](https://app.netlify.com).
2. Click **Sign up** or **Log in**.
3. Choose **Sign up with GitHub** (simplest for the next step).

---

## Step 3 — Create a new site from GitHub

1. On the Netlify dashboard, click **Add new site** → **Import an existing project**.
2. Click **GitHub** and authorize Netlify if asked.
3. Pick the repository **`yourdrive-1`** (your fork or your own repo).
4. On **Configure build** you should see (filled in from `netlify.toml`):

   | Field | Value |
   |-------|--------|
   | Branch to deploy | `main` (or your default branch) |
   | Build command | `npm ci && npm exec -w web -- vite build` |
   | Publish directory | `apps/web/dist` |

5. Do **not** change those unless Netlify shows them empty — then type them exactly as above.
6. Click **Deploy site**.

---

## Step 4 — Wait for the build

1. Netlify shows **Site deploy in progress**.
2. Wait until the status is **Published** (often 2–5 minutes).
3. If the build **fails**, open the deploy log, scroll to the red error line, and fix that issue (common: wrong branch or missing `package-lock.json` — run `npm install` at repo root locally, commit `package-lock.json`, push, then **Trigger deploy** → **Retry**).

---

## Step 5 — Open your live site

1. On the site overview, click the URL like **`https://random-name-123.netlify.app`**.
2. You should see the YourDrive landing page.
3. Try **Pricing** or **About** in the menu — links should work.

---

## Step 6 — (Optional) Rename the URL

1. **Site configuration** → **Domain management** → **Options** on the default `*.netlify.app` domain.
2. **Edit** and choose a name, e.g. `yourdrive-demo` → `https://yourdrive-demo.netlify.app`.

---

## Step 7 — (Optional) Set the public site URL for share links

Only needed if you use features that copy links to the clipboard and you want the correct domain:

1. **Site configuration** → **Environment variables** → **Add a variable**.
2. Key: `VITE_PUBLIC_SITE_URL`  
   Value: `https://your-site-name.netlify.app` (no trailing slash).
3. **Save**, then **Deploys** → **Trigger deploy** → **Deploy site** (rebuild so Vite picks up the variable).

---

## Optional: connect an API

Netlify does **not** run `apps/api`, PostgreSQL, or file storage. To use login and the dashboard:

1. Run the API + database somewhere (see main [README](../README.md) — Docker, `npm run dev`, or a host like Railway/Render).
2. Note your API’s public URL, e.g. `https://api.example.com`.
3. In Netlify → **Environment variables**, add:

   | Key | Example value |
   |-----|-----------------|
   | `VITE_API_URL` | `https://api.example.com/api` |

4. Redeploy the site.

Your API must allow CORS from your Netlify domain and support cookies/credentials if you use refresh-token cookies. Same-origin `/api` proxying only works when the API is behind the same host; with Netlify + external API, `VITE_API_URL` is the usual approach.

---

## Troubleshooting

| Problem | What to do |
|---------|------------|
| Blank page after refresh on `/pricing` | Confirm `netlify.toml` and `apps/web/public/_redirects` exist and redeploy. |
| Login fails / network error | Expected until `VITE_API_URL` points to a running API. |
| Build fails on `npm ci` | Commit `package-lock.json` at repo root and push again. |

---

## Summary

1. Fork or push repo to GitHub.  
2. Netlify → **Import from GitHub** → select repo → **Deploy**.  
3. Open the `*.netlify.app` link.  
4. Add API env vars only when you have a backend running.
