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

export interface PlayerRepositoryContract {
  findPlayers(filter: PlayerListFilter, page: number, limit: number): Promise<{ items: PopulatedPlayerEntity[]; total: number }>;
  findPlayerById(playerId: string): Promise<PlayerEntity | null>;
  findPlayerWithTeamById(playerId: string): Promise<PopulatedPlayerEntity | null>;
  findPlayerByMobile(mobile: string): Promise<PlayerEntity | null>;
  findPlayerByEmail(email: string): Promise<PlayerEntity | null>;
  findPlayerWithJerseyNumber(teamId: string, jerseyNo: number, excludePlayerId?: string): Promise<PlayerEntity | null>;
  findSoldPlayersByTeam(teamId: string): Promise<PlayerEntity[]>;
  countPlayers(filter: Partial<Pick<PlayerFields, "status" | "auctionStatus">>): Promise<number>;
  countPlayerGoalReferences(playerId: string): Promise<number>;
  getPlayerAuctionCounts(): Promise<PlayerAuctionCountsDTO>;
  countInvalidSoldPlayers(): Promise<number>;
  createPlayer(data: PlayerFields): Promise<PlayerEntity>;
  updatePlayer(playerId: string, data: Partial<PlayerFields>): Promise<PlayerEntity | null>;
  deletePlayer(playerId: string): Promise<boolean>;
}

export interface IPlayerService {
  getPlayers(query: PlayerQueryDTO, isAdmin: boolean): Promise<import("../../shared/types/common.types.js").PaginatedResult<PlayerResponseDTO>>;
  getPlayerById(playerId: string, isAdmin: boolean): Promise<PlayerResponseDTO>;
  createPlayer(input: PlayerCreateDTO): Promise<PlayerAdminDTO>;
  updatePlayer(playerId: string, input: PlayerUpdateDTO): Promise<PlayerAdminDTO>;
  assignPlayerToTeam(playerId: string, input: import("./player.dto.js").PlayerAssignmentInput): Promise<PlayerAdminDTO>;
  markPlayerUnsold(playerId: string): Promise<PlayerAdminDTO>;
  deactivatePlayer(playerId: string): Promise<PlayerAdminDTO>;
  deletePlayer(playerId: string): Promise<void>;
}

export interface IPlayerController {
  getPlayers: import("../../shared/types/common.types.js").ControllerMethod;
  getPlayerById: import("../../shared/types/common.types.js").ControllerMethod;
  createPlayer: import("../../shared/types/common.types.js").ControllerMethod;
  updatePlayer: import("../../shared/types/common.types.js").ControllerMethod;
  assignPlayerToTeam: import("../../shared/types/common.types.js").ControllerMethod;
  markPlayerUnsold: import("../../shared/types/common.types.js").ControllerMethod;
  deactivatePlayer: import("../../shared/types/common.types.js").ControllerMethod;
  deletePlayer: import("../../shared/types/common.types.js").ControllerMethod;
}
