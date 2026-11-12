import type { Request, Response, NextFunction } from "express";
import { ApiResponse } from "../../utils/apiResponse.utils.js";
import { HTTP_STATUS } from "../../shared/constants/http-status.constants.js";
import { getRequiredRouteParam } from "../../shared/utils/routeParams.js";
import { MANAGER_MESSAGES } from "../../shared/constants/messages.constants.js";
import type { PaginatedResult } from "../../shared/types/common.types.js";
import type {
  IManagerController,
  IManagerService,
  ManagerResponseDTO,
  AdminManagerDTO,
} from "./manager.types.js";
import {
  managerCreateSchema,
  managerQuerySchema,
  managerUpdateSchema,
} from "./manager.schema.js";
import type {
  ManagerCreateInput,
  ManagerQueryInput,
  ManagerUpdateInput,
} from "./manager.dto.js";




export class ManagerController implements IManagerController {
  constructor(
    private readonly _managerService: IManagerService
  ) {}

  getManagers = async (
    request: Request,
    response: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const query: ManagerQueryInput = managerQuerySchema.parse(request.query);
      const result: PaginatedResult<ManagerResponseDTO> =
        await this._managerService.getManagers(query, Boolean(request.user));
      response
        .status(HTTP_STATUS.OK)
        .json(
          ApiResponse.success<ManagerResponseDTO[]>(
            MANAGER_MESSAGES.MANAGERS_FETCHED,
            result.items,
            result.pagination,
          ),
        );
    } catch (error: unknown) {
      next(error);
    }
  };

  getManagerById = async (
    request: Request,
    response: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const managerId: string = getRequiredRouteParam(request.params.id, "id");
      const manager: ManagerResponseDTO =
        await this._managerService.getManagerById(
          managerId,
          Boolean(request.user),
        );
      response
        .status(HTTP_STATUS.OK)
        .json(
          ApiResponse.success<ManagerResponseDTO>(
            MANAGER_MESSAGES.MANAGER_FETCHED,
            manager,
          ),
        );
    } catch (error: unknown) {
      next(error);
    }
  };

  createManager = async (
    request: Request,
    response: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const input: ManagerCreateInput = managerCreateSchema.parse(request.body);
      const manager: AdminManagerDTO =
        await this._managerService.createManager(input);
      response
        .status(HTTP_STATUS.CREATED)
        .json(ApiResponse.success(MANAGER_MESSAGES.MANAGER_CREATED, manager));
    } catch (error: unknown) {
      next(error);
    }
  };

  updateManager = async (
    request: Request,
    response: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const managerId: string = getRequiredRouteParam(request.params.id, "id");
      const input: ManagerUpdateInput = managerUpdateSchema.parse(request.body);
      const manager: AdminManagerDTO = await this._managerService.updateManager(
        managerId,
        input,
      );
      response
        .status(HTTP_STATUS.OK)
        .json(ApiResponse.success(MANAGER_MESSAGES.MANAGER_UPDATED, manager));
    } catch (error: unknown) {
      next(error);
    }
  };

  deleteManager = async (
    request: Request,
    response: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const managerId: string = getRequiredRouteParam(request.params.id, "id");
      await this._managerService.deleteManager(managerId);
      response
        .status(HTTP_STATUS.OK)
        .json(
          ApiResponse.success<null>(MANAGER_MESSAGES.MANAGER_DELETED, null),
        );
    } catch (error: unknown) {
      next(error);
    }
  };
}