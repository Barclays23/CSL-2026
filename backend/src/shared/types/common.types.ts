export interface Asset { url: string; publicId: string; }
export interface Pagination { page: number; limit: number; total: number; totalPages: number; }
export interface ApiResponse<T> { success: boolean; message: string; data: T; pagination?: Pagination; }
export type UserRole = "admin";
export type RecordStatus = "active" | "inactive";
export type Position = "GK" | "DF" | "MF" | "FW";
export type AuctionStatus = "pending" | "sold" | "unsold";
export type AuctionState = "not_started" | "in_progress" | "completed";
export type MatchStage = "group" | "quarter_final" | "semi_final" | "final";
export type MatchStatus = "scheduled" | "live" | "completed" | "postponed" | "cancelled";
export type GoalType = "normal" | "own_goal";
