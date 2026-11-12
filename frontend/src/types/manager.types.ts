import type { Asset } from "@/types/api.types";
import type { TeamBrief } from "@/types/team.types";
export type ManagerStatus = "active" | "inactive";
export interface PublicManager { _id: string; name: string; teamRef: string | null; team?: TeamBrief | null; role: string | null; profilePic: Asset | null; status: ManagerStatus; }
export interface AdminManager extends PublicManager { mobile: string; email: string | null; dateOfBirth: string | null; }
export interface ManagerQuery { page?: number; limit?: number; search?: string; status?: ManagerStatus | ""; teamRef?: string; }
export interface ManagerCreate { name: string; mobile: string; email?: string | null; dateOfBirth?: string | null; teamRef?: string | null; role?: string | null; profilePic?: Asset | null; status?: ManagerStatus; }
export type ManagerUpdate = Partial<ManagerCreate>;
