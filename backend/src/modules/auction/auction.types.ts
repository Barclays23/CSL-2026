import type { AuctionState } from "../settings/settings.types.js";
import type { SettingsEntity } from "../settings/settings.types.js";

export interface AuctionTeamValidation {
  teamId: string | null;
  teamName: string;
  message: string;
}

export interface AuctionCompletionValidationResult {
  valid: boolean;
  errors: AuctionTeamValidation[];
}

export interface AuctionTotals {
  activeAuctionPlayers: number;
  pendingPlayers: number;
  soldPlayers: number;
  unsoldPlayers: number;
  totalAuctionSpend: number;
  activeTeams: number;
}

export type { IAuctionService, IAuctionController } from "./auction.interfaces.js";
