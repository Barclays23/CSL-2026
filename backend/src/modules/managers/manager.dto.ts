import type { Asset } from "../../shared/types/common.types.js";
import type { ManagerStatus } from "./manager.types.js";

export interface CreateManagerDto {
  name: string;
  mobile: string;
  email?: string | null;
  dateOfBirth?: Date | null;
  teamRef?: string | null;
  role?: string | null;
  profilePic?: Asset | null;
  status?: ManagerStatus;
}
export type UpdateManagerDto = Partial<CreateManagerDto>;
export interface ManagerQueryDto {
  page: number;
  limit: number;
  search?: string;
  status?: ManagerStatus;
  teamRef?: string;
}
export type ManagerCreateInput = CreateManagerDto;
export type ManagerUpdateInput = UpdateManagerDto;
export type ManagerQueryInput = ManagerQueryDto;
export type ManagerCreateDTO = CreateManagerDto;
export type ManagerUpdateDTO = UpdateManagerDto;
export type ManagerQueryDTO = ManagerQueryDto;
