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
  _id: string;
  createdAt: Date;
  updatedAt: Date;
}

export type SettingsUpdateDTO = SettingsUpdateInput;

export interface ISettingsRepository {
  getTournamentSettings(): Promise<SettingsEntity | null>;
  initializeTournamentSettings(): Promise<SettingsEntity>;
  updateTournamentSettings(data: SettingsUpdateDTO): Promise<SettingsEntity | null>;
}

export interface ISettingsService {
  getTournamentSettings(): Promise<SettingsEntity>;
  initializeTournamentSettings(): Promise<SettingsEntity>;
  updateTournamentSettings(data: SettingsUpdateDTO): Promise<SettingsEntity>;
}
