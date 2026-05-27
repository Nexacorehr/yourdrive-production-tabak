/**
 * Writes apps/web/public/_redirects before the Vite build.
 *
 * Netlify env (Site configuration → Environment variables):
 *   NETLIFY_API_PROXY_URL = https://your-api.onrender.com   (no trailing slash)
 *
 * When set, /api/* is proxied to the backend so the SPA can keep using relative /api
 * (auth cookies work better than cross-origin VITE_API_URL).
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const redirectsPath = path.join(root, "apps/web/public/_redirects");

const rawProxy = (process.env.NETLIFY_API_PROXY_URL || "").trim();
const proxyBase = rawProxy.replace(/\/+$/, "");

const lines = [];

if (proxyBase) {
  if (!/^https?:\/\//i.test(proxyBase)) {
    console.error(
      "[prepare-netlify] NETLIFY_API_PROXY_URL must start with http:// or https://",
    );
    process.exit(1);
  }
  lines.push(`/api/*  ${proxyBase}/api/:splat  200`);
  console.log(`[prepare-netlify] API proxy → ${proxyBase}/api/*`);
} else {
  console.warn(
    "[prepare-netlify] NETLIFY_API_PROXY_URL is not set — /api calls will 404 until you add your Render API URL and redeploy.",
  );
}

lines.push("/*    /index.html   200");

fs.writeFileSync(redirectsPath, `${lines.join("\n")}\n`);
console.log(`[prepare-netlify] Wrote ${redirectsPath}`);
