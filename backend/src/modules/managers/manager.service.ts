import { Types } from "mongoose";
import { AppError } from "../../shared/errors/appError.js";
import { normalizeEmail, normalizeMobile } from "../../shared/utils/normalizeInput.js";
import type { TeamRepository } from "../teams/team.repository.js";
import type {
  AdminManagerDTO,
  ManagerCreateDTO,
  ManagerListFilter,
  ManagerQueryDTO,
  ManagerRepositoryContract,
  ManagerResponseDTO,
  ManagerUpdateDTO,
  PopulatedManagerEntity,
  PublicManagerDTO,
} from "./manager.types.js";
import type { PaginatedResult } from "../../shared/types/common.types.js";

export class ManagerService {
  constructor(
    private readonly managerRepository: ManagerRepositoryContract,
    private readonly teamRepository: TeamRepository,
  ) {}

  async getManagers(query: ManagerQueryDTO, isAdmin: boolean): Promise<PaginatedResult<ManagerResponseDTO>> {
    const filter: ManagerListFilter = {};
    if (query.search) filter.name = { $regex: query.search, $options: "i" };
    if (isAdmin && query.status) filter.status = query.status;
    else if (!isAdmin) filter.status = "active";
    if (query.teamRef) filter.teamRef = new Types.ObjectId(query.teamRef);

    const result = await this.managerRepository.findManagers(filter, query.page, query.limit);
    return {
      items: result.items.map((manager) => this.mapManagerToResponseDTO(manager, isAdmin)),
      total: result.total,
      page: query.page,
      limit: query.limit,
    };
  }

  async getManagerById(managerId: string, isAdmin: boolean): Promise<ManagerResponseDTO> {
    if (!Types.ObjectId.isValid(managerId)) throw new AppError("Invalid manager ID", 400, "INVALID_ID");
    const manager = await this.managerRepository.findManagerWithTeamById(managerId);
    if (!manager || (!isAdmin && manager.status !== "active")) {
      throw new AppError("Manager not found", 404, "NOT_FOUND");
    }
    return this.mapManagerToResponseDTO(manager, isAdmin);
  }

  async createManager(input: ManagerCreateDTO): Promise<AdminManagerDTO> {
    const mobile = normalizeMobile(input.mobile);
    const email = normalizeEmail(input.email);
    await this.ensureManagerContactDetailsAreUnique(mobile, email);

    const teamRef = input.teamRef ? await this.validateActiveTeam(input.teamRef) : null;
    const manager = await this.managerRepository.createManager({
      name: input.name.trim(),
      mobile,
      email,
      dateOfBirth: input.dateOfBirth ?? null,
      teamRef,
      role: input.role?.trim() || null,
      profilePic: input.profilePic ?? null,
      status: input.status,
    });

    const populatedManager = await this.managerRepository.findManagerWithTeamById(String(manager._id));
    if (!populatedManager) throw new AppError("Created manager could not be retrieved", 500, "MANAGER_CREATE_FAILED");
    return this.mapManagerToAdminDTO(populatedManager);
  }

  async updateManager(managerId: string, input: ManagerUpdateDTO): Promise<AdminManagerDTO> {
    if (!Types.ObjectId.isValid(managerId)) throw new AppError("Invalid manager ID", 400, "INVALID_ID");
    const existing = await this.managerRepository.findManagerById(managerId);
    if (!existing) throw new AppError("Manager not found", 404, "NOT_FOUND");

    const updateData: Partial<import("./manager.types.js").ManagerFields> = {};
    if (input.name !== undefined) updateData.name = input.name.trim();
    if (input.mobile !== undefined) {
      const mobile = normalizeMobile(input.mobile);
      if (mobile !== existing.mobile) await this.ensureManagerMobileIsUnique(mobile);
      updateData.mobile = mobile;
    }
    if (input.email !== undefined) {
      const email = normalizeEmail(input.email);
      if (email && email !== existing.email) await this.ensureManagerEmailIsUnique(email);
      updateData.email = email;
    }
    if (input.dateOfBirth !== undefined) updateData.dateOfBirth = input.dateOfBirth;
    if (input.teamRef !== undefined) updateData.teamRef = input.teamRef ? await this.validateActiveTeam(input.teamRef) : null;
    if (input.role !== undefined) updateData.role = input.role?.trim() || null;
    if (input.profilePic !== undefined) updateData.profilePic = input.profilePic;
    if (input.status !== undefined) updateData.status = input.status;

    const updated = await this.managerRepository.updateManager(managerId, updateData);
    if (!updated) throw new AppError("Manager not found", 404, "NOT_FOUND");

    const populatedManager = await this.managerRepository.findManagerWithTeamById(managerId);
    if (!populatedManager) throw new AppError("Updated manager could not be retrieved", 500, "MANAGER_UPDATE_FAILED");
    return this.mapManagerToAdminDTO(populatedManager);
  }

  async deleteManager(managerId: string): Promise<void> {
    if (!Types.ObjectId.isValid(managerId)) throw new AppError("Invalid manager ID", 400, "INVALID_ID");
    const deleted = await this.managerRepository.deleteManager(managerId);
    if (!deleted) throw new AppError("Manager not found", 404, "NOT_FOUND");
  }

  private async ensureManagerContactDetailsAreUnique(mobile: string, email: string | null): Promise<void> {
    await this.ensureManagerMobileIsUnique(mobile);
    if (email) await this.ensureManagerEmailIsUnique(email);
  }

  private async ensureManagerMobileIsUnique(mobile: string): Promise<void> {
    if (await this.managerRepository.findManagerByMobile(mobile)) {
      throw new AppError("Mobile already exists", 409, "DUPLICATE_MOBILE", { mobile: "Mobile already exists" });
    }
  }

  private async ensureManagerEmailIsUnique(email: string): Promise<void> {
    if (await this.managerRepository.findManagerByEmail(email)) {
      throw new AppError("Email already exists", 409, "DUPLICATE_EMAIL", { email: "Email already exists" });
    }
  }

  private async validateActiveTeam(teamId: string): Promise<Types.ObjectId> {
    const team = await this.teamRepository.findById(teamId);
    if (!team || team.status !== "active") throw new AppError("Select an active team", 422, "INVALID_TEAM");
    return new Types.ObjectId(teamId);
  }

  private mapManagerToResponseDTO(manager: PopulatedManagerEntity, isAdmin: boolean): ManagerResponseDTO {
    return isAdmin ? this.mapManagerToAdminDTO(manager) : this.mapManagerToPublicDTO(manager);
  }

  private mapManagerToPublicDTO(manager: PopulatedManagerEntity): PublicManagerDTO {
    const populatedTeam = manager.teamRef instanceof Types.ObjectId ? null : manager.teamRef;
    return {
      _id: String(manager._id),
      name: manager.name,
      teamRef: manager.teamRef ? String(populatedTeam?._id ?? manager.teamRef) : null,
      team: populatedTeam ? {
        _id: String(populatedTeam._id),
        name: populatedTeam.name,
        shortName: populatedTeam.shortName,
        logo: populatedTeam.logo,
        groupName: populatedTeam.groupName,
      } : null,
      role: manager.role,
      profilePic: manager.profilePic,
      status: manager.status,
    };
  }

  private mapManagerToAdminDTO(manager: PopulatedManagerEntity): AdminManagerDTO {
    return {
      ...this.mapManagerToPublicDTO(manager),
      mobile: manager.mobile,
      email: manager.email,
      dateOfBirth: manager.dateOfBirth?.toISOString() ?? null,
    };
  }
}
