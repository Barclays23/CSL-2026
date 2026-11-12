import axios from "axios";
import type { ApiErrorResponse } from "@/types/api.types";

export class ApiError extends Error {
  status: number;
  errorCode?: string;
  fieldErrors?: Record<string, string>;

  constructor(
    status: number,
    message: string,
    extras?: { errorCode?: string; fieldErrors?: Record<string, string> },
  ) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.errorCode = extras?.errorCode;
    this.fieldErrors = extras?.fieldErrors;
  }
}

export function toApiError(error: unknown) {
  if (error instanceof ApiError) return error;
  if (axios.isAxiosError<ApiErrorResponse>(error)) {
    const data = error.response?.data;
    const status = error.response?.status ?? 500;
    return new ApiError(status, data?.message || error.message || "Request failed", {
      errorCode: data?.errorCode,
      fieldErrors: data?.fieldErrors,
    });
  }
  if (error instanceof Error) return new ApiError(500, error.message);
  return new ApiError(500, "Something went wrong");
}

export function errorMessage(error: unknown) {
  return toApiError(error).message;
}
