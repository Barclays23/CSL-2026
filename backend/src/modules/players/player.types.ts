import type { Types } from "mongoose";
import type { Asset } from "../../shared/types/common.types.js";
import type { TeamBriefDTO } from "../teams/team.types.js";
import type { PlayerCreateInput, PlayerQueryInput, PlayerUpdateInput } from "./player.dto.js";

export type PlayerPosition = "GK" | "DF" | "MF" | "FW";
export type PlayerStatus = "active" | "inactive";
export type AuctionStatus = "pending" | "sold" | "unsold";

export interface PlayerFields {
  name: string;
  mobile: string;
  email: string | null;
  dateOfBirth: Date | null;
  position: PlayerPosition;
  isIconPlayer: boolean;
  teamRef: Types.ObjectId | null;
  jerseyNo: number | null;
  auctionPrice: number;
  auctionStatus: AuctionStatus;
  status: PlayerStatus;
  profilePic: Asset | null;
}

export interface PlayerEntity extends PlayerFields {
  _id: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export interface TeamBriefEntity {
  _id: Types.ObjectId;
  name: string;
  shortName: string | null;
  logo: Asset | null;
  groupName: string | null;
}

export interface PopulatedPlayerEntity extends Omit<PlayerEntity, "teamRef"> {
  teamRef: Types.ObjectId | TeamBriefEntity | null;
}

/** Exact player projection required by tournament statistics queries. */
export type PlayerStatisticsEntity = Pick<
  PlayerEntity,
  | "_id"
  | "name"
  | "position"
  | "isIconPlayer"
  | "teamRef"
  | "jerseyNo"
  | "auctionPrice"
  | "auctionStatus"
  | "status"
  | "profilePic"
>;

export interface PlayerPublicDTO {
  _id: string;
  name: string;
  position: PlayerPosition;
  isIconPlayer: boolean;
  teamRef: string | null;
  team: TeamBriefDTO | null;
  jerseyNo: number | null;
  auctionPrice: number;
  auctionStatus: AuctionStatus;
  status: PlayerStatus;
  profilePic: Asset | null;
}

export interface PlayerAdminDTO extends PlayerPublicDTO {
  mobile: string;
  email: string | null;
  dateOfBirth: string | null;
}

export type PlayerResponseDTO = PlayerPublicDTO | PlayerAdminDTO;
export type PlayerCreateDTO = PlayerCreateInput;
export type PlayerUpdateDTO = PlayerUpdateInput;
export type PlayerQueryDTO = PlayerQueryInput;

export interface PlayerListFilter {
  name?: { $regex: string; $options: "i" };
  position?: PlayerPosition;
  status?: PlayerStatus;
  auctionStatus?: AuctionStatus;
  teamRef?: Types.ObjectId | null;
}

export interface PlayerAuctionCountsDTO {
  activeAuctionPlayers: number;
  pendingPlayers: number;
  soldPlayers: number;
  unsoldPlayers: number;
  totalAuctionSpend: number;
}

export interface PlayerAssignmentInput {
  teamRef: string;
  auctionPrice: number;
  jerseyNo?: number | null;
}

export type { IPlayerRepository, IPlayerService, IPlayerController } from "./player.interfaces.js";
