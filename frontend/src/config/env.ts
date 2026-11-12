/**
 * Real backend integration is the default.
 * Set VITE_USE_MOCK_API=true only when you intentionally want to return
 * to the in-browser preview repository. Mock files and service fallbacks
 * remain in place as a rollback option until the live integration is verified.
 */
export const API_BASE_URL =
  (import.meta.env.VITE_API_BASE_URL as string | undefined)?.replace(/\/$/, "") ||
  "http://localhost:5000/api";

// Explicit opt-in to mock mode; undefined/false always uses the Express API.
export const USE_MOCK_API = import.meta.env.VITE_USE_MOCK_API === "true";

export const UPLOAD_PATH =
  (import.meta.env.VITE_UPLOAD_PATH as string | undefined) || "/uploads";
