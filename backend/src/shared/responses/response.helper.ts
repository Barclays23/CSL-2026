import type { Response } from "express";
import type { ApiResponse, Pagination } from "../types/common.types.js";

export function sendSuccess<T>(
  response: Response,
  data: T,
  message: string,
  statusCode: number = 200,
  pagination?: Pagination,
): Response<ApiResponse<T>> {
  const payload: ApiResponse<T> = {
    success: true,
    message,
    data,
    ...(pagination ? { pagination } : {}),
  };
  return response.status(statusCode).json(payload);
}
