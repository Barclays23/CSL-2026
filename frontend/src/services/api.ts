import axios from "axios";
import { API_BASE_URL } from "@/config/env";
import { toApiError } from "@/utils/errorHandler";

export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

api.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject(toApiError(error)),
);

export async function run<T>(work: () => Promise<T>) {
  try {
    return await work();
  } catch (error) {
    const apiError = toApiError(error);
    if (apiError.status === 401 && typeof window !== "undefined" && !window.location.pathname.endsWith("/admin/login")) {
      window.dispatchEvent(new CustomEvent("csl-unauthorized"));
    }
    throw apiError;
  }
}
