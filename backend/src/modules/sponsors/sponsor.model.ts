import { Schema, model } from "mongoose";
import type { Asset } from "../../shared/types/common.types.js";
import type { SponsorFields } from "./sponsor.types.js";

const assetSchema = new Schema<Asset>({
  url: { type: String, required: true },
  publicId: { type: String, required: true },
}, { _id: false });

const sponsorSchema = new Schema<SponsorFields>({
  name: { type: String, required: true, trim: true },
  logo: { type: assetSchema, default: null },
  tier: { type: String, default: null, trim: true },
  website: { type: String, default: null, trim: true },
  contactPerson: { type: String, default: null, select: false },
  contactMobile: { type: String, default: null, select: false },
  status: { type: String, enum: ["active", "inactive"], default: "active" },
  notes: { type: String, default: null, select: false },
}, { timestamps: true });

export type SponsorRecord = SponsorFields;
export const SponsorModel = model<SponsorFields>("Sponsor", sponsorSchema);
