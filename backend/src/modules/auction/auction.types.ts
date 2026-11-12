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

export interface IAuctionService {
  startAuction(): Promise<SettingsEntity>;
  completeAuction(): Promise<SettingsEntity>;
  reopenAuction(): Promise<SettingsEntity>;
  validateAuctionCompletion(): Promise<AuctionCompletionValidationResult>;
}

export interface IAuctionController {
  startAuction: import("express").RequestHandler;
  completeAuction: import("express").RequestHandler;
  reopenAuction: import("express").RequestHandler;
}
