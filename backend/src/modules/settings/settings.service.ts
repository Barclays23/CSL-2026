import { AppError } from "../../shared/errors/appError.js";
import type { ISettingsRepository, ISettingsService, SettingsEntity, SettingsUpdateDTO, AuctionState } from "./settings.types.js";

export class SettingsService implements ISettingsService {
  constructor(private readonly settingsRepository: ISettingsRepository) {}

  async getTournamentSettings(): Promise<SettingsEntity> {
    const settings = await this.settingsRepository.getTournamentSettings();
    if (!settings) throw new AppError("Tournament settings are not initialized", 500, "SETTINGS_MISSING");
    return settings;
  }

  async initializeTournamentSettings(): Promise<SettingsEntity> {
    return this.settingsRepository.initializeTournamentSettings();
  }

  async updateTournamentSettings(input: SettingsUpdateDTO): Promise<SettingsEntity> {
    const currentSettings = await this.getTournamentSettings();
    const startDate = input.startDate ?? currentSettings.startDate;
    const endDate = input.endDate ?? currentSettings.endDate;

    if (endDate < startDate) {
      throw new AppError("End date must be on or after start date", 422, "INVALID_DATES", {
        endDate: "End date must be on or after start date",
      });
    }

    const updatedSettings = await this.settingsRepository.updateTournamentSettings(input);
    if (!updatedSettings) throw new AppError("Settings not found", 404, "SETTINGS_NOT_FOUND");
    return updatedSettings;
  }

  async updateAuctionLifecycle(state: AuctionState, completedAt: Date | null): Promise<SettingsEntity> {
    const updatedSettings = await this.settingsRepository.updateAuctionLifecycle(state, completedAt);
    if (!updatedSettings) throw new AppError("Settings not found", 404, "SETTINGS_NOT_FOUND");
    return updatedSettings;
  }
}
