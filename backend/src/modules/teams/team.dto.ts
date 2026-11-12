import type { Asset } from "../../shared/types/common.types.js";
import type { TeamStatus } from "./team.types.js";

export interface CreateTeamDto {
  name: string;
  shortName?: string | null;
  logo?: Asset | null;
  poster?: Asset | null;
  groupName?: string | null;
  status?: TeamStatus;
}
export type UpdateTeamDto = Partial<CreateTeamDto>;
export interface TeamQueryDto {
  page: number;
  limit: number;
  search?: string;
  status?: TeamStatus;
  groupName?: string;
}
export type TeamCreateInput = CreateTeamDto;
export type TeamUpdateInput = UpdateTeamDto;
export type TeamQueryInput = TeamQueryDto;
export type TeamCreateDTO = CreateTeamDto;
export type TeamUpdateDTO = UpdateTeamDto;
export type TeamQueryDTO = TeamQueryDto;

import type { TeamFields, TeamAuctionStats } from "./team.types.js";
import type { PlayerPublicDTO } from "../players/player.types.js";

export interface TeamBriefDTO {
  _id: string;
  name: string;
  shortName: string | null;
  logo: Asset | null;
  groupName: string | null;
}

export interface TeamDTO extends TeamFields {
  _id: string;
  createdAt: string;
  updatedAt: string;
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
