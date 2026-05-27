# Netlify (Git-connected)

Everything is configured in **`netlify.toml`** at the repo root. No manual Netlify UI build settings are required.

## One-time Netlify setup

1. [app.netlify.com](https://app.netlify.com) → **Add new site** → **Import from Git**.
2. Select your **fork** of this repo.
3. **Do not** set a custom base directory or publish folder in the UI — clear those fields if present so `netlify.toml` applies.
4. Deploy. Netlify runs `npm run build:netlify` and publishes **`dist/`**.

## After you pull updates

Push to the connected branch; Netlify rebuilds automatically.

## Login / API

The static frontend deploys without the Node API. Sign-in and the dashboard need `apps/api` hosted elsewhere and `VITE_API_URL` in Netlify environment variables (optional).
