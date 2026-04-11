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
 * Express serves `/api/...` only. Env often wrongly copies `.../api/v1` from another template.
 */
function normalizeApiOrigin(input: string): string {
  const trimmed = input.trim().replace(/\/$/, "");
  try {
    const u = new URL(trimmed);
    const path = (u.pathname || "/").replace(/\/$/, "") || "/";
    if (path === "/" || path === "") {
      return u.origin;
    }
    if (/^\/api\/v\d+$/i.test(path)) {
      return u.origin;
    }
  } catch {
    /* relative or missing protocol — fall through */
  }
  return trimmed.replace(/\/api\/v\d+$/i, "");
}

/** Collapse .../api/vN/api/... → .../api/... (bad base + `/api/...` paths). */
function collapseDuplicateApiSegment(url: string): string {
  return url.replace(/\/api\/v\d+\/api\//gi, "/api/");
}

/** API origin only, no trailing slash. Prefer {@link apiUrl} for HTTP calls. */
export const API_BASE_URL = normalizeApiOrigin(resolveApiBase()).replace(/\/$/, "");

/**
 * Absolute URL for MindLink Express paths (e.g. `/api/auth/register`).
 * Survives `VITE_API_BASE_URL` mistakenly set to `https://host/api/v1`.
 */
export function apiUrl(path: string): string {
  const p = path.startsWith("/") ? path : `/${path}`;
  return collapseDuplicateApiSegment(`${API_BASE_URL}${p}`);
}
