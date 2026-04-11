/** MindLink Express API base URL (no path suffix). Override with VITE_API_BASE_URL in production. */
export const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL ?? "http://localhost:4000"
).replace(/\/$/, "");
