import type { Response } from "express";
export interface Pagination { page: number; limit: number; total: number; totalPages: number; }
export function sendSuccess<T>(res: Response, data: T, message: string, status = 200, pagination?: Pagination) {
  return res.status(status).json({ success: true, message, data, ...(pagination ? { pagination } : {}) });
}
