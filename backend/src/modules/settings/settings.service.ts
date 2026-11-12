import { AppError } from "../../shared/errors/appError.js";
import { SettingsRepository } from "./settings.repository.js";
import type { SettingsUpdateInput } from "./settings.dto.js";
import type { SettingsRecord } from "./settings.model.js";

export class SettingsService {
  constructor(private readonly settingsRepository: SettingsRepository) {}
  async get(): Promise<SettingsRecord & { _id: import("mongoose").Types.ObjectId }> {
    const settings = await this.settingsRepository.getSingleton();
    if (!settings) throw new AppError("Tournament settings are not initialized", 500, "SETTINGS_MISSING");
    return settings;
  }
  async initialize(): Promise<SettingsRecord & { _id: import("mongoose").Types.ObjectId }> {
    return this.settingsRepository.initialize();
  }
  async updateSettings(data: SettingsUpdateInput): Promise<SettingsRecord & { _id: import("mongoose").Types.ObjectId }> {
    const current = await this.get();
    const startDate = data.startDate ?? current.startDate;
    const endDate = data.endDate ?? current.endDate;
    if (endDate < startDate) throw new AppError("End date must be on or after start date", 422, "INVALID_DATES", { endDate: "End date must be on or after start date" });
    const updated = await this.settingsRepository.updateSingleton(data);
    if (!updated) throw new AppError("Settings not found", 404, "SETTINGS_NOT_FOUND");
    return updated;
  }
}
