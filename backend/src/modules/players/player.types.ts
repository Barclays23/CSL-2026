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

export interface PopulatedPlayerEntity extends Omit<PlayerEntity, "teamRef"> {
  teamRef: Types.ObjectId | TeamBriefEntity | null;
}

export interface TeamBriefEntity {
  _id: Types.ObjectId;
  name: string;
  shortName: string | null;
  logo: Asset | null;
  groupName: string | null;
}

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

export interface PlayerRepositoryContract {
  findPlayers(filter: PlayerListFilter, page: number, limit: number): Promise<{ items: PopulatedPlayerEntity[]; total: number }>;
  findPlayerById(playerId: string): Promise<PlayerEntity | null>;
  findPlayerWithTeamById(playerId: string): Promise<PopulatedPlayerEntity | null>;
  findPlayerByMobile(mobile: string): Promise<PlayerEntity | null>;
  findPlayerByEmail(email: string): Promise<PlayerEntity | null>;
  findPlayerWithJerseyNumber(teamId: string, jerseyNo: number, excludePlayerId?: string): Promise<PlayerEntity | null>;
  findSoldPlayersByTeam(teamId: string): Promise<PlayerEntity[]>;
  countPlayers(filter: Partial<Pick<PlayerEntity, "status" | "auctionStatus">>): Promise<number>;
  countPlayerGoalReferences(playerId: string): Promise<number>;
  getPlayerAuctionCounts(): Promise<PlayerAuctionCountsDTO>;
  countInvalidSoldPlayers(): Promise<number>;
  createPlayer(data: PlayerCreateDTO & { mobile: string; email: string | null; teamRef: Types.ObjectId | null; jerseyNo: number | null; auctionPrice: number; auctionStatus: AuctionStatus }): Promise<PlayerEntity>;
  updatePlayer(playerId: string, data: Partial<PlayerEntity>): Promise<PlayerEntity | null>;
  deletePlayer(playerId: string): Promise<boolean>;
}
