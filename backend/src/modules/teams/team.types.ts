import type { Types } from "mongoose";
import type { TeamBriefDTO, TeamDTO, TeamAuctionCardDTO, TeamAuctionTotalsDTO, TeamAuctionSummaryDTO } from "./team.dto.js";
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







export type { ITeamRepository, ITeamService, ITeamController } from "./team.interfaces.js";

export type { TeamBriefDTO, TeamDTO, TeamAuctionCardDTO, TeamAuctionTotalsDTO, TeamAuctionSummaryDTO } from "./team.dto.js";
