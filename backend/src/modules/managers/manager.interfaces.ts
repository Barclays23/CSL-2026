import type { Types } from "mongoose";
import type { Asset, PaginatedResult } from "../../shared/types/common.types.js";
import type { TeamBriefDTO } from "../teams/team.types.js";
import type { ManagerCreateInput, ManagerQueryInput, ManagerUpdateInput } from "./manager.dto.js";

export interface IManagerRepository {
  findManagers(filter: ManagerListFilter, page: number, limit: number): Promise<{ items: PopulatedManagerEntity[]; total: number }>;
  findManagerById(managerId: string): Promise<ManagerEntity | null>;
  findManagerWithTeamById(managerId: string): Promise<PopulatedManagerEntity | null>;
  findManagerByMobile(mobile: string): Promise<ManagerEntity | null>;
  findManagerByEmail(email: string): Promise<ManagerEntity | null>;
  createManager(data: ManagerFields): Promise<ManagerEntity>;
  updateManager(managerId: string, data: Partial<ManagerFields>): Promise<ManagerEntity | null>;
  deleteManager(managerId: string): Promise<boolean>;
}
export interface IManagerService {
  getManagers(query: ManagerQueryDTO, isAdmin: boolean): Promise<PaginatedResult<ManagerResponseDTO>>;
  getManagerById(managerId: string, isAdmin: boolean): Promise<ManagerResponseDTO>;
  createManager(input: ManagerCreateDTO): Promise<AdminManagerDTO>;
  updateManager(managerId: string, input: ManagerUpdateDTO): Promise<AdminManagerDTO>;
  deleteManager(managerId: string): Promise<void>;
}
export interface IManagerController {
  getManagers: import("../../shared/types/common.types.js").ControllerMethod;
  getManagerById: import("../../shared/types/common.types.js").ControllerMethod;
  createManager: import("../../shared/types/common.types.js").ControllerMethod;
  updateManager: import("../../shared/types/common.types.js").ControllerMethod;
  deleteManager: import("../../shared/types/common.types.js").ControllerMethod;
}
