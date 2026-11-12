import type { Asset } from "@/types/api.types";
import type { PublicPlayer } from "@/types/player.types";
export type TeamStatus = "active" | "inactive";
export interface TeamBrief { _id: string; name: string; shortName: string | null; logo: Asset | null; groupName: string | null; }
export interface Team extends TeamBrief { poster: Asset | null; status: TeamStatus; createdAt: string; updatedAt: string; }
export interface TeamCreate { name: string; shortName?: string | null; logo?: Asset | null; poster?: Asset | null; groupName?: string | null; status?: TeamStatus; }
export type TeamUpdate = Partial<TeamCreate>;
export type TeamWrite = TeamCreate;
export interface TeamSquadStats { auctionBudget: number; purchaseCost: number; remainingBalance: number; playerCount: number; remainingSlots: number; averagePurchaseCost: number; iconPlayerCount: number; goalkeeperCount: number; maxPlayers: number; requiredIcons: number; requiredGoalkeepers: number; }
export interface TeamAuctionCard { team: Team; players: PublicPlayer[]; stats: TeamSquadStats; }
export interface AuctionTotals { activeAuctionPlayers: number; pendingPlayers: number; soldPlayers: number; unsoldPlayers: number; totalAuctionSpend: number; activeTeams: number; }
export interface AuctionSummary { totals: AuctionTotals; teams: TeamAuctionCard[]; }
