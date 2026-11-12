import type { Asset } from "../../shared/types/common.types.js";
import type { PlayerPosition, PlayerStatus, AuctionStatus } from "./player.types.js";

/** Validated request payloads passed from the controller to the service. */
export interface CreatePlayerDto {
  name: string;
  mobile: string;
  email?: string | null;
  dateOfBirth?: Date | null;
  position: PlayerPosition;
  isIconPlayer: boolean;
  teamRef?: string | null;
  jerseyNo?: number | null;
  auctionPrice: number;
  auctionStatus: AuctionStatus;
  status: PlayerStatus;
  profilePic?: Asset | null;
}

export type UpdatePlayerDto = Partial<CreatePlayerDto>;

export interface AssignPlayerDto {
  teamRef: string;
  auctionPrice: number;
  jerseyNo?: number | null;
}

export interface PlayerQueryDto {
  page: number;
  limit: number;
  search?: string;
  position?: PlayerPosition;
  status?: PlayerStatus;
  auctionStatus?: AuctionStatus;
  teamRef?: string | "unassigned";
}

/** Backward-compatible names used by existing services/controllers. */
export type PlayerCreateInput = CreatePlayerDto;
export type PlayerUpdateInput = UpdatePlayerDto;
export type PlayerAssignmentInput = AssignPlayerDto;
export type PlayerQueryInput = PlayerQueryDto;
export type PlayerCreateDTO = CreatePlayerDto;
export type PlayerUpdateDTO = UpdatePlayerDto;
export type PlayerQueryDTO = PlayerQueryDto;

import type { TeamBriefDTO } from "../teams/team.types.js";

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

export interface PlayerAuctionCountsDTO {
  activeAuctionPlayers: number;
  pendingPlayers: number;
  soldPlayers: number;
  unsoldPlayers: number;
  totalAuctionSpend: number;
}

