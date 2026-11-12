import type { Types } from "mongoose";
import type { Asset } from "../../shared/types/common.types.js";
import type { PlayerPublicDTO } from "../players/player.types.js";
import type { TeamCreateInput, TeamQueryInput, TeamUpdateInput } from "./team.dto.js";

export type TeamStatus = "active" | "inactive";

export interface TeamFields {
  name: string;
  shortName: string | null;
  logo: Asset | null;
  poster: Asset | null;
  groupName: string | null;
  status: TeamStatus;
}

export interface TeamEntity extends TeamFields {
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

export interface TeamBriefDTO {
  _id: string;
  name: string;
  shortName: string | null;
  logo: Asset | null;
  groupName: string | null;
}

export interface TeamDTO extends TeamFields {
  _id: string;
  createdAt: Date;
  updatedAt: Date;
}

export type TeamCreateDTO = TeamCreateInput;
export type TeamUpdateDTO = TeamUpdateInput;
export type TeamQueryDTO = TeamQueryInput;

export interface TeamListFilter {
  status?: TeamStatus;
  groupName?: string;
  name?: { $regex: string; $options: "i" };
}

export interface TeamReferenceCounts {
  players: number;
  matches: number;
  managers: number;
}

export interface TeamAuctionStats {
  auctionBudget: number;
  purchaseCost: number;
  remainingBalance: number;
  playerCount: number;
  remainingSlots: number;
  averagePurchaseCost: number;
  iconPlayerCount: number;
  goalkeeperCount: number;
  maxPlayers: number;
  requiredIcons: number;
  requiredGoalkeepers: number;
}

export interface TeamAuctionCardDTO {
  team: TeamDTO;
  players: PlayerPublicDTO[];
  stats: TeamAuctionStats;
}

export interface TeamAuctionTotalsDTO {
  activeAuctionPlayers: number;
  pendingPlayers: number;
  soldPlayers: number;
  unsoldPlayers: number;
  totalAuctionSpend: number;
  activeTeams: number;
}

export interface TeamAuctionSummaryDTO {
  totals: TeamAuctionTotalsDTO;
  teams: TeamAuctionCardDTO[];
}

export interface TeamRepositoryContract {
  findTeams(filter: TeamListFilter, page: number, limit: number): Promise<{ items: TeamEntity[]; total: number }>;
  findTeamById(teamId: string): Promise<TeamEntity | null>;
  findTeamByName(name: string): Promise<TeamEntity | null>;
  countActiveTeams(): Promise<number>;
  findTeamReferenceCounts(teamId: string): Promise<TeamReferenceCounts>;
  createTeam(data: TeamCreateDTO): Promise<TeamEntity>;
  updateTeam(teamId: string, data: TeamUpdateDTO): Promise<TeamEntity | null>;
  deleteTeam(teamId: string): Promise<boolean>;
}
