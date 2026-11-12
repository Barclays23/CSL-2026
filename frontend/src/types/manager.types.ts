import type { Asset } from "@/types/api.types";
import type { TeamBrief } from "@/types/team.types";

export type PersonStatus = "active" | "inactive";

export interface PublicManager {
  _id: string;
  name: string;
  email: string | null;
  dateOfBirth: string | null;
  teamRef: string | null;
  team?: TeamBrief | null;
  role: string | null;
  profilePic: Asset | null;
  status: PersonStatus;
}

export interface AdminManager extends PublicManager {
  mobile: string;
  email: string | null;
  dateOfBirth: string | null;
}

export interface ManagerQuery {
  page?: number;
  limit?: number;
  search?: string;
  status?: PersonStatus | "";
  teamRef?: string;
}

export interface ManagerWrite {
  name: string;
  mobile: string;
  email?: string | null;
  dateOfBirth?: string | null;
  teamRef?: string | null;
  role?: string | null;
  profilePic?: Asset | null;
  status: PersonStatus;
}

export type ManagerResponse = PublicManager | AdminManager;
