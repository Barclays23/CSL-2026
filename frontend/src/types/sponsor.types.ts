import type { Asset } from "@/types/api.types";

export type SponsorStatus = "active" | "inactive";

export interface PublicSponsor {
  _id: string;
  name: string;
  logo: Asset | null;
  tier: string | null;
  website: string | null;
  status: SponsorStatus;
}

export interface AdminSponsor extends PublicSponsor {
  contactPerson: string | null;
  contactMobile: string | null;
  notes: string | null;
}

export interface SponsorQuery {
  page?: number;
  limit?: number;
  search?: string;
  status?: SponsorStatus | "";
}

export interface SponsorWrite {
  name: string;
  logo?: Asset | null;
  tier?: string | null;
  website?: string | null;
  contactPerson?: string | null;
  contactMobile?: string | null;
  notes?: string | null;
  status: SponsorStatus;
}
