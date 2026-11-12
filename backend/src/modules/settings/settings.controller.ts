import type { Request, Response, NextFunction } from "express";
import { ApiResponse } from "../../utils/apiResponse.utils.js";
import { HTTP_STATUS } from "../../shared/constants/http-status.constants.js";
import { SETTINGS_MESSAGES } from "../../shared/constants/messages.constants.js";
import type { ISettingsController, ISettingsService } from "./settings.interfaces.js";
import type { SettingsResponseDTO, SettingsEntity } from "./settings.types.js";
import { mapSettingsEntityToResponseDTO } from "./settings.mapper.js";
import { settingsUpdateSchema } from "./settings.schema.js";
import type { SettingsUpdateInput } from "./settings.dto.js";





export class SettingsController implements ISettingsController {
  constructor(
    private readonly _settingsService: ISettingsService
  ) {}

  getTournamentSettings = async (
    _request: Request,
    response: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const settings: SettingsEntity = await this._settingsService.getTournamentSettings();
      const settingsDTO: SettingsResponseDTO = mapSettingsEntityToResponseDTO(settings);
      response
        .status(HTTP_STATUS.OK)
        .json(ApiResponse.success<SettingsResponseDTO>(SETTINGS_MESSAGES.SETTINGS_FETCHED, settingsDTO));
    } catch (error: unknown) {
      next(error);
    }
  };

  updateTournamentSettings = async (
    request: Request,
    response: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const input: SettingsUpdateInput = settingsUpdateSchema.parse(request.body);
      const settings: SettingsEntity = await this._settingsService.updateTournamentSettings(input);
      const settingsDTO: SettingsResponseDTO = mapSettingsEntityToResponseDTO(settings);
      response
        .status(HTTP_STATUS.OK)
        .json(ApiResponse.success<SettingsResponseDTO>(SETTINGS_MESSAGES.SETTINGS_UPDATED, settingsDTO));
    } catch (error: unknown) {
      next(error);
    }
  };
}