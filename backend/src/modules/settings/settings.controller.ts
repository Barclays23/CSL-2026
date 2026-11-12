import type { RequestHandler } from "express";
import { asyncHandler } from "../../shared/utils/asyncHandler.js";
import { sendSuccess } from "../../shared/responses/response.helper.js";
import type { ISettingsController, ISettingsService } from "./settings.types.js";
import { settingsUpdateSchema } from "./settings.dto.js";

export class SettingsController implements ISettingsController {
  constructor(private readonly settingsService: ISettingsService) {}

  getTournamentSettings: RequestHandler = asyncHandler(async (_request, response) => {
    const settings = await this.settingsService.getTournamentSettings();
    sendSuccess(response, settings, "Settings fetched");
  });

  updateTournamentSettings: RequestHandler = asyncHandler(async (request, response) => {
    const input = settingsUpdateSchema.parse(request.body);
    const settings = await this.settingsService.updateTournamentSettings(input);
    sendSuccess(response, settings, "Settings updated");
  });
}
