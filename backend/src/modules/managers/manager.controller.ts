import type { RequestHandler } from "express";
import { asyncHandler } from "../../shared/utils/asyncHandler.js";
import { sendSuccess } from "../../shared/responses/response.helper.js";
import { ManagerService } from "./manager.service.js";
import { managerCreateSchema, managerQuerySchema, managerUpdateSchema } from "./manager.dto.js";
export class ManagerController {
  constructor(private readonly managerService: ManagerService) {}
  getManagers: RequestHandler = asyncHandler(async (req, res) => {
    const result = await this.managerService.getManagers(managerQuerySchema.parse(req.query), Boolean(req.user));
    sendSuccess(res, result.items, "Managers fetched", 200, { page: result.page, limit: result.limit, total: result.total, totalPages: Math.ceil(result.total / result.limit) });
  });
  getManagerById: RequestHandler = asyncHandler(async (req, res) => sendSuccess(res, await this.managerService.getManagerById(String(req.params.id), Boolean(req.user)), "Manager fetched"));
  createManager: RequestHandler = asyncHandler(async (req, res) => sendSuccess(res, await this.managerService.createManager(managerCreateSchema.parse(req.body)), "Manager created", 201));
  updateManager: RequestHandler = asyncHandler(async (req, res) => sendSuccess(res, await this.managerService.updateManager(String(req.params.id), managerUpdateSchema.parse(req.body)), "Manager updated"));
  deleteManager: RequestHandler = asyncHandler(async (req, res) => { await this.managerService.deleteManager(String(req.params.id)); sendSuccess(res, null, "Manager deleted"); });
}
