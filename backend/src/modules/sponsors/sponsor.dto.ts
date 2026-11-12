import type { Asset } from "../../shared/types/common.types.js";
import type { SponsorStatus } from "./sponsor.types.js";

export interface CreateSponsorDto {
  name: string;
  logo?: Asset | null;
  tier?: string | null;
  website?: string | null;
  contactPerson?: string | null;
  contactMobile?: string | null;
  notes?: string | null;
  status?: SponsorStatus;
}
export type UpdateSponsorDto = Partial<CreateSponsorDto>;
export interface SponsorQueryDto {
  page: number;
  limit: number;
  search?: string;
  status?: SponsorStatus;
}
export type SponsorCreateDTO = CreateSponsorDto;
export type SponsorUpdateDTO = UpdateSponsorDto;
export type GetSponsorsQueryDTO = SponsorQueryDto;

import type { SponsorFields } from "./sponsor.types.js";

export type PublicSponsorDTO = Pick<SponsorFields, "name" | "logo" | "tier" | "website" | "status"> & { _id: string };

export type AdminSponsorDTO = PublicSponsorDTO & Pick<SponsorFields, "contactPerson" | "contactMobile" | "notes">;

export type SponsorResponseDTO = PublicSponsorDTO | AdminSponsorDTO;

export type SponsorCreateData = SponsorCreateDTO;
export type SponsorUpdateData = SponsorUpdateDTO;
export type SponsorQuery = GetSponsorsQueryDTO;
