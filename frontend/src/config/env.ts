/**
 * Preview defaults to the in-browser sample tournament.
 * Set VITE_USE_MOCK_API=false and VITE_API_BASE_URL to the Express API
 * when the separate backend is ready. No secrets belong here.
 */
export const API_BASE_URL =
  (import.meta.env.VITE_API_BASE_URL as string | undefined)?.replace(/\/$/, "") ||
  "http://localhost:5000/api";

export const USE_MOCK_API = import.meta.env.VITE_USE_MOCK_API !== "false";

export const UPLOAD_PATH =
  (import.meta.env.VITE_UPLOAD_PATH as string | undefined) || "/uploads";
