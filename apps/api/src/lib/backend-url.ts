/** Public API base URL (OAuth callbacks, etc.). */
export function getBackendUrl(): string {
  const explicit = (process.env.BACKEND_URL || "").trim();
  if (explicit) return explicit.replace(/\/+$/, "");

  // Render sets this automatically — no need to copy the service URL into BACKEND_URL.
  const render = (process.env.RENDER_EXTERNAL_URL || "").trim();
  if (render) return render.replace(/\/+$/, "");

  return "http://localhost:3000";
}
