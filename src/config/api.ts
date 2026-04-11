/** MindLink Express API (no trailing slash). Override for local: VITE_API_BASE_URL=http://localhost:4000 */
export const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL ?? "https://mindlink-ti7t.onrender.com"
).replace(/\/$/, "");
