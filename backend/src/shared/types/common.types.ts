import type { Request, Response, NextFunction } from "express";
import type { Types } from "mongoose";

export type UserRole = "admin";
export type RecordStatus = "active" | "inactive";
export type Position = "GK" | "DF" | "MF" | "FW";
export type AuctionStatus = "pending" | "sold" | "unsold";
export type AuctionState = "not_started" | "in_progress" | "completed";
export type MatchStage = "group" | "quarter_final" | "semi_final" | "final";
export type MatchStatus = "scheduled" | "live" | "completed" | "postponed" | "cancelled";
export type GoalType = "normal" | "own_goal";

export interface AuthUser {
  id: string;
  role: UserRole;
  email: string;
}

export interface AuthRequest extends Request {
  user?: AuthUser;
}

export interface Asset {
  url: string;
  publicId: string;
}

export interface IPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface IPaginationQuery {
  page: number;
  limit: number;
}

export interface PaginatedResult<TEntity> {
  items: TEntity[];
  pagination: IPagination;
}

export type ControllerMethod = (
  request: Request,
  response: Response,
  next: NextFunction
) => Promise<void>;

export type MongoId = Types.ObjectId;
