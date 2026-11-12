import type { Asset } from "@/types/api.types";
import type { TeamBrief } from "@/types/team.types";
export type Position = "GK" | "DF" | "MF" | "FW";
export type PlayerStatus = "active" | "inactive";
export type AuctionStatus = "pending" | "sold" | "unsold";
export interface PublicPlayer { _id: string; name: string; position: Position; isIconPlayer: boolean; teamRef: string | null; team?: TeamBrief | null; jerseyNo: number | null; auctionPrice: number; auctionStatus: AuctionStatus; status: PlayerStatus; profilePic: Asset | null; }
export interface AdminPlayer extends PublicPlayer { mobile: string; email: string | null; dateOfBirth: string | null; }
export interface PlayerQuery { page?: number; limit?: number; search?: string; position?: Position | ""; status?: PlayerStatus | ""; auctionStatus?: AuctionStatus | ""; teamRef?: string; }
export interface PlayerCreate { name: string; mobile: string; email?: string | null; dateOfBirth?: string | null; position: Position; isIconPlayer?: boolean; teamRef?: string | null; jerseyNo?: number | null; auctionPrice?: number; auctionStatus?: AuctionStatus; status?: PlayerStatus; profilePic?: Asset | null; }
export type PlayerUpdate = Partial<PlayerCreate>;
export type PlayerWrite = PlayerCreate;
export interface AssignPlayer { teamRef: string; auctionPrice: number; jerseyNo?: number | null; }
