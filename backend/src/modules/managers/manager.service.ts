import { Types, type QueryFilter } from "mongoose";
import { AppError } from "../../shared/errors/appError.js";
import { normalizeEmail, normalizeMobile } from "../../shared/utils/normalizeInput.js";
import { ManagerRepository, type ManagerListRecord } from "./manager.repository.js";
import { TeamRepository } from "../teams/team.repository.js";
import type { ManagerCreateInput, ManagerQueryInput, ManagerUpdateInput } from "./manager.dto.js";
import type { AdminManagerDTO, PublicManagerDTO } from "./manager.types.js";
import type { ManagerRecord } from "./manager.model.js";
export class ManagerService {
  constructor(private readonly managerRepository: ManagerRepository, private readonly teamRepository: TeamRepository) {}
  async getManagers(query: ManagerQueryInput, isAdmin: boolean): Promise<{ items: Array<PublicManagerDTO | AdminManagerDTO>; total: number; page: number; limit: number }> {
    const filter: QueryFilter<ManagerRecord> = {};
    if (query.search) filter.name = { $regex: query.search, $options: "i" };
    if (isAdmin && query.status) filter.status = query.status;
    else if (!isAdmin) filter.status = "active";
    if (query.teamRef) filter.teamRef = new Types.ObjectId(query.teamRef);
    const result = await this.managerRepository.listManagers(filter, query.page, query.limit);
    return { items: result.items.map((manager) => this.mapManagerResponse(manager, isAdmin)), total: result.total, page: query.page, limit: query.limit };
  }
  async getManagerById(managerId: string, isAdmin: boolean): Promise<PublicManagerDTO | AdminManagerDTO> {
    const manager = await this.managerRepository.findManagerById(managerId);
    if (!manager || (!isAdmin && manager.status !== "active")) throw new AppError("Manager not found", 404, "NOT_FOUND");
    return this.mapManagerResponse(manager, isAdmin);
  }
  private mapManagerResponse(manager: ManagerListRecord, isAdmin: boolean): PublicManagerDTO | AdminManagerDTO {
    const populatedTeam = manager.teamRef && !(manager.teamRef instanceof Types.ObjectId) ? manager.teamRef : null;
    const team = populatedTeam ? { _id: String(populatedTeam._id), name: populatedTeam.name, shortName: populatedTeam.shortName ?? null, logo: populatedTeam.logo ?? null, groupName: populatedTeam.groupName ?? null } : null;
    const base: PublicManagerDTO = { _id: String(manager._id), name: manager.name, teamRef: team?._id ?? (manager.teamRef ? String(manager.teamRef) : null), team, role: manager.role ?? null, profilePic: manager.profilePic ?? null, status: manager.status };
    return isAdmin ? { ...base, mobile: manager.mobile, email: manager.email ?? null, dateOfBirth: manager.dateOfBirth ?? null } : base;
  }
  async createManager(data: ManagerCreateInput): Promise<AdminManagerDTO> { return this.saveManager(data); }
  async updateManager(managerId: string, data: ManagerUpdateInput): Promise<AdminManagerDTO> {
    if (!await this.managerRepository.findById(managerId)) throw new AppError("Manager not found", 404, "NOT_FOUND");
    return this.saveManager(data, managerId);
  }
  private async saveManager(data: ManagerCreateInput | ManagerUpdateInput, managerId?: string): Promise<AdminManagerDTO> {
    if (data.teamRef) {
      const team = await this.teamRepository.findById(data.teamRef);
      if (!team || team.status !== "active") throw new AppError("Select an active team", 422, "INVALID_TEAM");
    }
    const mobile = data.mobile ? normalizeMobile(data.mobile) : undefined;
    const email = "email" in data ? normalizeEmail(data.email) : undefined;
    if (mobile) { const duplicate = await this.managerRepository.findByMobile(mobile); if (duplicate && String(duplicate._id) !== managerId) throw new AppError("Mobile already exists", 409, "DUPLICATE_MOBILE", { mobile: "Mobile already exists" }); }
    if (email) { const duplicate = await this.managerRepository.findByEmail(email); if (duplicate && String(duplicate._id) !== managerId) throw new AppError("Email already exists", 409, "DUPLICATE_EMAIL", { email: "Email already exists" }); }
    const payload = { ...data, ...(mobile ? { mobile } : {}), ...("email" in data ? { email: email ?? null } : {}) };
    const manager = managerId ? await this.managerRepository.updateManager(managerId, payload) : await this.managerRepository.createManager(payload as ManagerCreateInput);
    if (!manager) throw new AppError("Manager not found", 404, "NOT_FOUND");
    const populated = await this.managerRepository.findManagerById(String(manager._id));
    if (!populated) throw new AppError("Manager not found", 404, "NOT_FOUND");
    return this.mapManagerResponse(populated, true) as AdminManagerDTO;
  }
  async deleteManager(managerId: string): Promise<void> {
    if (!await this.managerRepository.deleteManager(managerId)) throw new AppError("Manager not found", 404, "NOT_FOUND");
  }
}
