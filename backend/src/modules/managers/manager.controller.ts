import type { Request, Response, NextFunction } from "express";
import { ApiResponse } from "../../shared/responses/apiResponse.utils.js";
import { HTTP_STATUS } from "../../shared/constants/http-status.constants.js";
import { MANAGER_MESSAGES } from "../../shared/constants/messages.constants.js";
import type { PaginatedResult } from "../../shared/types/common.types.js";
import type { IManagerController, IManagerService, ManagerResponseDTO, AdminManagerDTO } from "./manager.types.js";
import { managerCreateSchema, managerQuerySchema, managerUpdateSchema, type ManagerCreateInput, type ManagerQueryInput, type ManagerUpdateInput } from "./manager.dto.js";

export class ManagerController implements IManagerController {
  constructor(private readonly _managerService: IManagerService) {}

  async getManagers(request: Request, response: Response, next: NextFunction): Promise<void> {
    try {
      const query: ManagerQueryInput = managerQuerySchema.parse(request.query);
      const result: PaginatedResult<ManagerResponseDTO> = await this._managerService.getManagers(query, Boolean(request.user));
      response.status(HTTP_STATUS.OK).json(ApiResponse.success<ManagerResponseDTO[]>(MANAGER_MESSAGES.MANAGERS_FETCHED, result.items, result.pagination));
    } catch (error: unknown) { next(error); }
  }

  async getManagerById(request: Request<{ id: string }>, response: Response, next: NextFunction): Promise<void> {
    try {
      const managerId: string = request.params.id;
      const manager: ManagerResponseDTO = await this._managerService.getManagerById(managerId, Boolean(request.user));
      response.status(HTTP_STATUS.OK).json(ApiResponse.success<ManagerResponseDTO>(MANAGER_MESSAGES.MANAGER_FETCHED, manager));
    } catch (error: unknown) { next(error); }
  }

  async createManager(request: Request, response: Response, next: NextFunction): Promise<void> {
    try {
      const input: ManagerCreateInput = managerCreateSchema.parse(request.body);
      const manager: AdminManagerDTO = await this._managerService.createManager(input);
      response.status(HTTP_STATUS.CREATED).json(ApiResponse.success(MANAGER_MESSAGES.MANAGER_CREATED, manager));
    } catch (error: unknown) { next(error); }
  }

  async updateManager(request: Request<{ id: string }>, response: Response, next: NextFunction): Promise<void> {
    try {
      const managerId: string = request.params.id;
      const input: ManagerUpdateInput = managerUpdateSchema.parse(request.body);
      const manager: AdminManagerDTO = await this._managerService.updateManager(managerId, input);
      response.status(HTTP_STATUS.OK).json(ApiResponse.success(MANAGER_MESSAGES.MANAGER_UPDATED, manager));
    } catch (error: unknown) { next(error); }
  }

  async deleteManager(request: Request<{ id: string }>, response: Response, next: NextFunction): Promise<void> {
    try {
      const managerId: string = request.params.id;
      await this._managerService.deleteManager(managerId);
      response.status(HTTP_STATUS.OK).json(ApiResponse.success<null>(MANAGER_MESSAGES.MANAGER_DELETED, null));
    } catch (error: unknown) { next(error); }
  }
}
