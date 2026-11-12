import type { RequestHandler } from "express";
import { asyncHandler } from "../../shared/utils/asyncHandler.js";
import { sendSuccess } from "../../shared/responses/response.helper.js";
import type { ManagerService } from "./manager.service.js";
import { managerCreateSchema, managerQuerySchema, managerUpdateSchema } from "./manager.dto.js";

export class ManagerController {
  constructor(private readonly managerService: ManagerService) {}

  getManagers: RequestHandler = asyncHandler(async (request, response) => {
    const query = managerQuerySchema.parse(request.query);
    const result = await this.managerService.getManagers(query, Boolean(request.user));
    sendSuccess(response, result.items, "Managers fetched", 200, {
      page: result.page,
      limit: result.limit,
      total: result.total,
      totalPages: Math.ceil(result.total / result.limit),
    });
  });

  getManagerById: RequestHandler = asyncHandler(async (request, response) => {
    const manager = await this.managerService.getManagerById(String(request.params.id), Boolean(request.user));
    sendSuccess(response, manager, "Manager fetched");
  });

  createManager: RequestHandler = asyncHandler(async (request, response) => {
    const input = managerCreateSchema.parse(request.body);
    const manager = await this.managerService.createManager(input);
    sendSuccess(response, manager, "Manager created", 201);
  });

  updateManager: RequestHandler = asyncHandler(async (request, response) => {
    const input = managerUpdateSchema.parse(request.body);
    const manager = await this.managerService.updateManager(String(request.params.id), input);
    sendSuccess(response, manager, "Manager updated");
  });

  deleteManager: RequestHandler = asyncHandler(async (request, response) => {
    await this.managerService.deleteManager(String(request.params.id));
    sendSuccess(response, null, "Manager deleted");
  });
}
