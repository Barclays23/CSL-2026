import type { PointsRule } from "./settings.types.js";

export interface UpdateSettingsDto {
  tournamentName?: string;
  startDate?: Date;
  endDate?: Date;
  maxActivePlayers?: number;
  maxActiveTeams?: number;
  maxPlayersPerTeam?: number;
  auctionBudgetPerTeam?: number;
  requiredIconPlayers?: number;
  requiredGoalkeepers?: number;
  pointsRule?: PointsRule;
}
export type SettingsUpdateInput = UpdateSettingsDto;
export type SettingsUpdateDTO = UpdateSettingsDto;

import type { SettingsFields } from "./settings.types.js";

export interface SettingsResponseDTO extends Omit<SettingsFields, "startDate" | "endDate" | "auctionCompletedAt"> {
  _id: string;
  startDate: string;
  endDate: string;
  auctionCompletedAt: string | null;
  updatedAt: string;
}
