import type { Pagination } from "../types/common.types.js";

export interface ApiResponse<TData> {
  success: true;
  message: string;
  data: TData;
  pagination?: Pagination;
}

export interface ApiErrorResponse {
  success: false;
  message: string;
  errorCode?: string;
  fieldErrors?: Record<string, string>;
}
