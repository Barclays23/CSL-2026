import type { Types } from "mongoose";
import type { Asset } from "../../shared/types/common.types.js";
import type { PlayerPublicDTO } from "../players/player.types.js";
export type TeamStatus = "active" | "inactive";
export interface TeamBriefDTO { _id: string; name: string; shortName: string | null; logo: Asset | null; groupName: string | null; }
export interface TeamResponseDTO extends TeamBriefDTO { poster: Asset | null; status: TeamStatus; createdAt: Date; updatedAt: Date; }
export interface TeamAuctionStats {
  auctionBudget: number; purchaseCost: number; remainingBalance: number; playerCount: number; remainingSlots: number;
  averagePurchaseCost: number; iconPlayerCount: number; goalkeeperCount: number; maxPlayers: number;
  requiredIcons: number; requiredGoalkeepers: number;
}
export interface TeamAuctionCardDTO { team: TeamResponseDTO; players: PlayerPublicDTO[]; stats: TeamAuctionStats; }
export interface TeamAuctionSummaryDTO {
  totals: { activeAuctionPlayers: number; pendingPlayers: number; soldPlayers: number; unsoldPlayers: number; totalAuctionSpend: number; activeTeams: number };
  teams: TeamAuctionCardDTO[];
}
export interface TeamEntityId { _id: Types.ObjectId; }
