import type { Request } from "express";
export type UserRole = "admin";
export interface AuthUser { id: string; role: UserRole; email: string; }
export interface AuthRequest extends Request { user?: AuthUser; }
export interface Asset { url: string; publicId: string; }
export interface PaginationInput { page: number; limit: number; skip: number; }
