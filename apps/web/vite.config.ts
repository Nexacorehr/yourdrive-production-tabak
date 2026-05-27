import fs from "fs";
import path from "path";
import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react";

/** Netlify serves 404.html for missing paths; copy index.html so the SPA boots. */
function netlifySpaFallback(): Plugin {
  let outDir = path.resolve(__dirname, "dist");

  return {
    name: "netlify-spa-fallback",
    apply: "build",
    configResolved(config) {
      outDir = path.resolve(config.root, config.build.outDir);
    },
    closeBundle() {
      const indexHtml = path.join(outDir, "index.html");
      const fallbackHtml = path.join(outDir, "404.html");
      if (fs.existsSync(indexHtml)) {
        fs.copyFileSync(indexHtml, fallbackHtml);
      }
    },
  };
}

export default defineConfig({
  base: "/",
  plugins: [react(), netlifySpaFallback()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      // ESM bundle: avoid Rollup failing on CJS `exports.PLANS = void 0` from dist
      "@yourdrive/plans": path.resolve(
        __dirname,
        "../../packages/plans/src/index.ts",
      ),
    },
  },
  build: {
    outDir: "dist",
    emptyOutDir: true,
  },
  server: {
    host: "0.0.0.0",
    port: parseInt(process.env.PORT || "5173", 10),
    // Allow Cloudflare quick tunnel URLs (Host header is the tunnel subdomain)
    allowedHosts: [".trycloudflare.com"],
    proxy: {
      "/api": {
        // Default: localhost so setup works on any machine. Override with API_PROXY_TARGET (e.g. http://192.168.1.2:3000).
        target: process.env.API_PROXY_TARGET ?? "http://localhost:3000",
        changeOrigin: true,
        secure: false,
        ws: true,
      },
    },
  },
});
