import type { Types } from "mongoose";
import type { Asset } from "../../shared/types/common.types.js";
import type { TeamBriefDTO } from "../teams/team.types.js";
import type { ManagerCreateInput, ManagerQueryInput, ManagerUpdateInput } from "./manager.dto.js";

export type ManagerStatus = "active" | "inactive";

export interface ManagerFields {
  name: string;
  mobile: string;
  email: string | null;
  dateOfBirth: Date | null;
  teamRef: Types.ObjectId | null;
  role: string | null;
  profilePic: Asset | null;
  status: ManagerStatus;
}

export interface ManagerEntity extends ManagerFields {
  _id: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export interface PopulatedManagerEntity extends Omit<ManagerEntity, "teamRef"> {
  teamRef: Types.ObjectId | {
    _id: Types.ObjectId;
    name: string;
    shortName: string | null;
    logo: Asset | null;
    groupName: string | null;
  } | null;
}

export interface PublicManagerDTO {
  _id: string;
  name: string;
  teamRef: string | null;
  team: TeamBriefDTO | null;
  role: string | null;
  profilePic: Asset | null;
  status: ManagerStatus;
}

export interface AdminManagerDTO extends PublicManagerDTO {
  mobile: string;
  email: string | null;
  dateOfBirth: string | null;
}

export type ManagerResponseDTO = PublicManagerDTO | AdminManagerDTO;
export type ManagerCreateDTO = ManagerCreateInput;
export type ManagerUpdateDTO = ManagerUpdateInput;
export type ManagerQueryDTO = ManagerQueryInput;

export interface ManagerListFilter {
  name?: { $regex: string; $options: "i" };
  status?: ManagerStatus;
  teamRef?: Types.ObjectId;
}

export interface ManagerRepositoryContract {
  findManagers(filter: ManagerListFilter, page: number, limit: number): Promise<{ items: PopulatedManagerEntity[]; total: number }>;
  findManagerById(managerId: string): Promise<ManagerEntity | null>;
  findManagerWithTeamById(managerId: string): Promise<PopulatedManagerEntity | null>;
  findManagerByMobile(mobile: string): Promise<ManagerEntity | null>;
  findManagerByEmail(email: string): Promise<ManagerEntity | null>;
  createManager(data: Omit<ManagerCreateDTO, "dateOfBirth"> & { dateOfBirth: Date | null; mobile: string; email: string | null; teamRef: Types.ObjectId | null }): Promise<ManagerEntity>;
  updateManager(managerId: string, data: Partial<ManagerEntity>): Promise<ManagerEntity | null>;
  deleteManager(managerId: string): Promise<boolean>;
}
