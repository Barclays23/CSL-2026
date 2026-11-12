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

export interface ISponsorRepository {
  findSponsors(filter: SponsorListFilter, page: number, limit: number, includePrivateFields: boolean): Promise<SponsorListResult>;
  findSponsorById(sponsorId: string, includePrivateFields: boolean): Promise<SponsorEntity | null>;
  createSponsor(data: SponsorCreateData): Promise<SponsorEntity>;
  updateSponsor(sponsorId: string, data: SponsorUpdateData, includePrivateFields: boolean): Promise<SponsorEntity | null>;
  deleteSponsor(sponsorId: string): Promise<boolean>;
}

export interface ISponsorService {
  getSponsors(query: SponsorQuery, isAdmin: boolean): Promise<PaginatedResult<SponsorResponseDTO>>;
  getSponsorById(sponsorId: string, isAdmin: boolean): Promise<SponsorResponseDTO>;
  createSponsor(data: SponsorCreateData): Promise<AdminSponsorDTO>;
  updateSponsor(sponsorId: string, data: SponsorUpdateData): Promise<AdminSponsorDTO>;
  deleteSponsor(sponsorId: string): Promise<void>;
}

export interface ISponsorController {
  getSponsors: import("../../shared/types/common.types.js").ControllerMethod;
  getSponsorById: import("../../shared/types/common.types.js").ControllerMethod;
  createSponsor: import("../../shared/types/common.types.js").ControllerMethod;
  updateSponsor: import("../../shared/types/common.types.js").ControllerMethod;
  deleteSponsor: import("../../shared/types/common.types.js").ControllerMethod;
}
