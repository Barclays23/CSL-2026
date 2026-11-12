import type { Types } from "mongoose";
import type { SettingsResponseDTO } from "./settings.dto.js";
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




export type { ISettingsRepository, ISettingsService, ISettingsController } from "./settings.interfaces.js";

export type { SettingsResponseDTO } from "./settings.dto.js";

export type { SettingsUpdateDTO } from "./settings.dto.js";
