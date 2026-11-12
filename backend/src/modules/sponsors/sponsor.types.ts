import type { Types } from "mongoose";
import type { PublicSponsorDTO, AdminSponsorDTO, SponsorResponseDTO } from "./sponsor.dto.js";
import type { PaginatedResult } from "../../shared/types/common.types.js";
import type { Asset } from "../../shared/types/common.types.js";
import type { SponsorCreateDTO, SponsorUpdateDTO, GetSponsorsQueryDTO } from "./sponsor.dto.js";

export type SponsorStatus = "active" | "inactive";

export interface SponsorFields {
  name: string;
  logo: Asset | null;
  tier: string | null;
  website: string | null;
  contactPerson: string | null;
  contactMobile: string | null;
  status: SponsorStatus;
  notes: string | null;
}

export interface SponsorEntity extends SponsorFields {
  _id: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}








export interface SponsorListFilter {
  status?: SponsorStatus;
  name?: { $regex: string; $options: "i" };
}

export interface SponsorListResult {
  items: SponsorEntity[];
  total: number;
}

export type { ISponsorRepository, ISponsorService, ISponsorController } from "./sponsor.interfaces.js";

export type { PublicSponsorDTO, AdminSponsorDTO, SponsorResponseDTO } from "./sponsor.dto.js";

export type { SponsorCreateData, SponsorUpdateData, SponsorQuery } from "./sponsor.dto.js";
