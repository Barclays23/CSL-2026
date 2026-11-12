import type { Response } from "express";
import type { Pagination } from "../types/common.types.js";
import type { ApiResponse } from "./response.types.js";

export function sendSuccess<TData>(
  response: Response,
  data: TData,
  message: string,
  statusCode = 200,
  pagination?: Pagination,
): Response<ApiResponse<TData>> {
  const payload: ApiResponse<TData> = {
    success: true,
    message,
    data,
    ...(pagination ? { pagination } : {}),
  };
  return response.status(statusCode).json(payload);
}
