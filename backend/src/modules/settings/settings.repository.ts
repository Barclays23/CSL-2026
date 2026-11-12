import { SettingsModel } from "./settings.model.js";
import type { ISettingsRepository } from "./settings.interfaces.js";
import type { SettingsEntity, SettingsFields, AuctionState } from "./settings.types.js";

export class SettingsRepository implements ISettingsRepository {
  async getTournamentSettings(): Promise<SettingsEntity | null> {
    return SettingsModel.findOne({ singletonKey: "CSL_CURRENT" }).lean<SettingsEntity>().exec();
  }

  async initializeTournamentSettings(): Promise<SettingsEntity> {
    const settings = await SettingsModel.findOneAndUpdate(
      { singletonKey: "CSL_CURRENT" },
      { $setOnInsert: { singletonKey: "CSL_CURRENT" } },
      { upsert: true, new: true, setDefaultsOnInsert: true, runValidators: true },
    ).lean<SettingsEntity>().exec();

    if (!settings) throw new Error("Tournament settings could not be initialized");
    return settings;
  }

  async updateTournamentSettings(data: Partial<SettingsFields>): Promise<SettingsEntity | null> {
    return SettingsModel.findOneAndUpdate(
      { singletonKey: "CSL_CURRENT" },
      { $set: data },
      { new: true, runValidators: true },
    ).lean<SettingsEntity>().exec();
  }

  async updateAuctionLifecycle(state: AuctionState, completedAt: Date | null): Promise<SettingsEntity | null> {
    return SettingsModel.findOneAndUpdate(
      { singletonKey: "CSL_CURRENT" },
      { $set: { auctionState: state, auctionCompletedAt: completedAt } },
      { new: true, runValidators: true },
    ).lean<SettingsEntity>().exec();
  }
}
