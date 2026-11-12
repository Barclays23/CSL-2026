import type { Types } from "mongoose";
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

export type PublicSponsorDTO = Pick<SponsorFields, "name" | "logo" | "tier" | "website" | "status"> & { _id: string };
export type AdminSponsorDTO = PublicSponsorDTO & Pick<SponsorFields, "contactPerson" | "contactMobile" | "notes">;
export type SponsorResponseDTO = PublicSponsorDTO | AdminSponsorDTO;
export type SponsorCreateData = SponsorCreateDTO;
export type SponsorUpdateData = SponsorUpdateDTO;
export type SponsorQuery = GetSponsorsQueryDTO;

export interface SponsorListFilter {
  status?: SponsorStatus;
  name?: { $regex: string; $options: "i" };
}

export interface SponsorListResult {
  items: SponsorEntity[];
  total: number;
}

export type { ISponsorRepository, ISponsorService, ISponsorController } from "./sponsor.interfaces.js";
