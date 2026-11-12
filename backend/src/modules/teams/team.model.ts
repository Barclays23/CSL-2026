import { Schema, model } from "mongoose";
import type { Asset } from "../../shared/types/common.types.js";
import type { TeamFields } from "./team.types.js";

const assetSchema = new Schema<Asset>({
  url: { type: String, required: true },
  publicId: { type: String, required: true },
}, { _id: false });

const teamSchema = new Schema<TeamFields>({
  name: { type: String, required: true, trim: true, unique: true },
  shortName: { type: String, default: null, trim: true },
  logo: { type: assetSchema, default: null },
  poster: { type: assetSchema, default: null },
  groupName: { type: String, default: null, trim: true },
  status: { type: String, enum: ["active", "inactive"], default: "active" },
}, { timestamps: true });

export type TeamRecord = TeamFields;
export const TeamModel = model<TeamFields>("Team", teamSchema);
