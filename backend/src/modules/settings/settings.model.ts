import { Schema, model } from "mongoose";
import type { SettingsFields } from "./settings.types.js";

const settingsSchema = new Schema<SettingsFields>({
  singletonKey: { type: String, required: true, default: "CSL_CURRENT", unique: true, immutable: true },
  tournamentName: { type: String, required: true, trim: true, default: "CSL Football Tournament 2026" },
  startDate: { type: Date, required: true, default: () => new Date() },
  endDate: { type: Date, required: true, default: () => new Date() },
  maxActivePlayers: { type: Number, required: true, default: 54, min: 1 },
  maxActiveTeams: { type: Number, required: true, default: 6, min: 1 },
  maxPlayersPerTeam: { type: Number, required: true, default: 9, min: 1 },
  auctionBudgetPerTeam: { type: Number, required: true, default: 10000, min: 0 },
  requiredIconPlayers: { type: Number, required: true, default: 1, min: 0 },
  requiredGoalkeepers: { type: Number, required: true, default: 1, min: 0 },
  pointsRule: {
    win: { type: Number, default: 3, min: 0 },
    draw: { type: Number, default: 1, min: 0 },
    loss: { type: Number, default: 0, min: 0 },
  },
  auctionState: { type: String, enum: ["not_started", "in_progress", "completed"], default: "not_started" },
  auctionCompletedAt: { type: Date, default: null },
}, { timestamps: true, versionKey: false });

export type SettingsRecord = SettingsFields;
export const SettingsModel = model<SettingsFields>("Settings", settingsSchema);
