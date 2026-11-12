import type { Types } from "mongoose";
import type { SettingsUpdateInput } from "./settings.dto.js";

export interface PointsRule {
  win: number;
  draw: number;
  loss: number;
}

export type AuctionState = "not_started" | "in_progress" | "completed";

export interface SettingsFields {
  singletonKey: "CSL_CURRENT";
  tournamentName: string;
  startDate: Date;
  endDate: Date;
  maxActivePlayers: number;
  maxActiveTeams: number;
  maxPlayersPerTeam: number;
  auctionBudgetPerTeam: number;
  requiredIconPlayers: number;
  requiredGoalkeepers: number;
  pointsRule: PointsRule;
  auctionState: AuctionState;
  auctionCompletedAt: Date | null;
}

export interface SettingsEntity extends SettingsFields {
  _id: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

/** JSON response shape returned by the Settings API. */
export interface SettingsResponseDTO extends Omit<SettingsFields, "startDate" | "endDate" | "auctionCompletedAt"> {
  _id: string;
  startDate: string;
  endDate: string;
  auctionCompletedAt: string | null;
  updatedAt: string;
}

export type SettingsUpdateDTO = SettingsUpdateInput;

export interface ISettingsRepository {
  getTournamentSettings(): Promise<SettingsEntity | null>;
  initializeTournamentSettings(): Promise<SettingsEntity>;
  updateTournamentSettings(data: Partial<SettingsFields>): Promise<SettingsEntity | null>;
  updateAuctionLifecycle(state: AuctionState, completedAt: Date | null): Promise<SettingsEntity | null>;
}

export interface ISettingsService {
  getTournamentSettings(): Promise<SettingsEntity>;
  initializeTournamentSettings(): Promise<SettingsEntity>;
  updateTournamentSettings(data: SettingsUpdateDTO): Promise<SettingsEntity>;
  updateAuctionLifecycle(state: AuctionState, completedAt: Date | null): Promise<SettingsEntity>;
}

export interface ISettingsController {
  getTournamentSettings: import("../../shared/types/common.types.js").ControllerMethod;
  updateTournamentSettings: import("../../shared/types/common.types.js").ControllerMethod;
}
