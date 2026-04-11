const RENDER_API = "https://mindlink-ti7t.onrender.com";

/** Local dev default when .env omits override */
const DEV_FALLBACK = "https://mindlink-ti7t.onrender.com";

function resolveApiBase(): string {
  const raw = import.meta.env.VITE_API_BASE_URL?.trim();
  if (!raw) {
    return import.meta.env.DEV ? DEV_FALLBACK : RENDER_API;
  }
  // Production builds: ignore mis-set Vercel env pointing at localhost
  if (
    import.meta.env.PROD &&
    (raw.includes("localhost") || raw.includes("127.0.0.1"))
  ) {
    return RENDER_API;
  }
  return raw;
}

/** MindLink Express API (no trailing slash). */
export const API_BASE_URL = resolveApiBase().replace(/\/$/, "");
