import type { Types } from "mongoose";
import type { Asset } from "../../shared/types/common.types.js";
import type { PlayerPublicDTO } from "../players/player.types.js";

export type TeamStatus = "active" | "inactive";

export interface TeamFields {
  name: string;
  shortName: string | null;
  logo: Asset | null;
  poster: Asset | null;
  groupName: string | null;
  status: TeamStatus;
}

export interface TeamDTO extends TeamFields {
  _id: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface TeamBriefDTO {
  _id: string;
  name: string;
  shortName: string | null;
  logo: Asset | null;
  groupName: string | null;
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

export type TeamId = Types.ObjectId;
