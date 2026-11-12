import type { IPagination } from "../types/common.types.js";

export interface IApiResponse<TData> {
  success: boolean;
  message: string;
  data: TData;
  pagination?: IPagination;
}

export interface IApiErrorResponse {
  success: false;
  message: string;
  errorCode?: string;
  fieldErrors?: Record<string, string>;
}

export type ApiErrorResponse = IApiErrorResponse;
