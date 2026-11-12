import type { RequestHandler } from "express";
import { asyncHandler } from "../../shared/utils/asyncHandler.js";
import { sendSuccess } from "../../shared/responses/response.helper.js";
import { SettingsService } from "./settings.service.js";
import { settingsUpdateSchema } from "./settings.dto.js";
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}
  getSettings: RequestHandler = asyncHandler(async (_req, res) => sendSuccess(res, await this.settingsService.get(), "Settings fetched"));
  updateSettings: RequestHandler = asyncHandler(async (req, res) => sendSuccess(res, await this.settingsService.updateSettings(settingsUpdateSchema.parse(req.body)), "Settings updated"));
}
