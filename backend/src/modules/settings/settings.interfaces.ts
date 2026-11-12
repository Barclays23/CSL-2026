import type { AuctionState, SettingsFields, SettingsEntity, SettingsUpdateDTO } from "./settings.types.js";
import type { Types } from "mongoose";
import type { SettingsUpdateInput } from "./settings.dto.js";

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
