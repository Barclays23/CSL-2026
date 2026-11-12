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
