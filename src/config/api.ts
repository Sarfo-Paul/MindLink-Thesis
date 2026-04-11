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

/**
 * Express routes are mounted at `/api/...` (no `/api/v1` on the server).
 * If VITE_API_BASE_URL was copied from VITE_SERVER_API_URL (`.../api/v1`),
 * `${base}/api/auth/register` would become `.../api/v1/api/auth/register` → 404.
 */
function originOnlyApiBase(url: string): string {
  return url.replace(/\/$/, "").replace(/\/api\/v\d+$/i, "");
}

/** MindLink Express API origin (no trailing slash). */
export const API_BASE_URL = originOnlyApiBase(resolveApiBase());
