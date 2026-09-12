import type { AxiosError } from "axios";

/** User-visible message from a failed auth/API request. */
export function axiosErrorMessage(err: unknown, fallback: string): string {
  if (typeof err === "object" && err !== null && "isAxiosError" in err) {
    const ax = err as AxiosError<{ error?: string }>;
    const fromServer = ax.response?.data?.error;
    if (typeof fromServer === "string" && fromServer.length > 0) return fromServer;
    const status = ax.response?.status;
    if (status === 404) return "API not found. Redeploy the frontend or check the server URL.";
    if (status === 500) return "Server error. Try again in a moment.";
    if (status === 409) return "An account with this email already exists.";
    if (ax.code === "ERR_NETWORK" || ax.message === "Network Error") {
      return "Cannot reach the API. Check CORS on the server and your network.";
    }
  }
  if (err instanceof Error && err.message.includes("ECONNREFUSED")) {
    return "Cannot connect to the server. Is the API running?";
  }
  return fallback;
}
