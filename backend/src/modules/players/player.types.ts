import type { Types } from "mongoose";
import type { Asset } from "../../shared/types/common.types.js";
export type PlayerPosition = "GK" | "DF" | "MF" | "FW";
export type PlayerStatus = "active" | "inactive";
export type PlayerAuctionStatus = "pending" | "sold" | "unsold";
export interface TeamBriefDTO { _id: string; name: string; shortName: string | null; logo: Asset | null; groupName: string | null; }
export interface PlayerPublicDTO {
  _id: string; name: string; position: PlayerPosition; isIconPlayer: boolean; teamRef: string | null;
  team: TeamBriefDTO | null; jerseyNo: number | null; auctionPrice: number; auctionStatus: PlayerAuctionStatus;
  status: PlayerStatus; profilePic: Asset | null;
}
export interface PlayerAdminDTO extends PlayerPublicDTO { mobile: string; email: string | null; dateOfBirth: Date | null; }
export type PlayerResponseDTO = PlayerPublicDTO | PlayerAdminDTO;
export interface PlayerFilter {
  name?: { $regex: string; $options: "i" };
  position?: PlayerPosition;
  status?: PlayerStatus;
  auctionStatus?: PlayerAuctionStatus;
  teamRef?: string | null;
}
export interface PlayerListRecord {
  _id: Types.ObjectId;
  name: string; mobile: string; email: string | null; dateOfBirth: Date | null; position: PlayerPosition;
  isIconPlayer: boolean; teamRef: Types.ObjectId | TeamBriefDTO | null; jerseyNo: number | null; auctionPrice: number;
  auctionStatus: PlayerAuctionStatus; status: PlayerStatus; profilePic: Asset | null;
}
