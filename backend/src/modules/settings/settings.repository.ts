import type { Types } from "mongoose";
import { SettingsModel, type SettingsRecord } from "./settings.model.js";
import type { SettingsUpdateInput } from "./settings.dto.js";
export class SettingsRepository {
  async getSingleton(): Promise<(SettingsRecord & { _id: Types.ObjectId }) | null> {
    return SettingsModel.findOne({ singletonKey: "CSL_CURRENT" }).lean().exec() as Promise<(SettingsRecord & { _id: Types.ObjectId }) | null>;
  }
  async initialize(): Promise<SettingsRecord & { _id: Types.ObjectId }> {
    const settings = await SettingsModel.findOneAndUpdate({ singletonKey: "CSL_CURRENT" }, { $setOnInsert: { singletonKey: "CSL_CURRENT" } }, { upsert: true, new: true, setDefaultsOnInsert: true }).lean().exec();
    if (!settings) throw new Error("Unable to initialize tournament settings");
    return settings as SettingsRecord & { _id: Types.ObjectId };
  }
  async updateSingleton(data: SettingsUpdateInput): Promise<(SettingsRecord & { _id: Types.ObjectId }) | null> {
    return SettingsModel.findOneAndUpdate({ singletonKey: "CSL_CURRENT" }, { $set: data }, { new: true, runValidators: true }).lean().exec() as Promise<(SettingsRecord & { _id: Types.ObjectId }) | null>;
  }
}
