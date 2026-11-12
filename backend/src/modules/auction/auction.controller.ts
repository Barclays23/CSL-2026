import type { Request, Response, NextFunction } from "express";
import { ApiResponse } from "../../utils/apiResponse.utils.js";
import { HTTP_STATUS } from "../../shared/constants/http-status.constants.js";
import { AUCTION_MESSAGES } from "../../shared/constants/messages.constants.js";
import type { IAuctionController, IAuctionService } from "./auction.types.js";
import { mapSettingsEntityToResponseDTO } from "../settings/settings.mapper.js";
import type { SettingsResponseDTO, SettingsEntity } from "../settings/settings.types.js";

export class AuctionController implements IAuctionController {
  constructor(private readonly _auctionService: IAuctionService) {
    this.startAuction = this.startAuction.bind(this);
    this.completeAuction = this.completeAuction.bind(this);
    this.reopenAuction = this.reopenAuction.bind(this);
  }

  async startAuction(_request: Request, response: Response, next: NextFunction): Promise<void> {
    try {
      const settings: SettingsEntity = await this._auctionService.startAuction();
      const settingsDTO: SettingsResponseDTO = mapSettingsEntityToResponseDTO(settings);
      response.status(HTTP_STATUS.OK).json(ApiResponse.success<SettingsResponseDTO>(AUCTION_MESSAGES.AUCTION_STARTED, settingsDTO));
    } catch (error: unknown) { next(error); }
  }

  async completeAuction(_request: Request, response: Response, next: NextFunction): Promise<void> {
    try {
      const settings: SettingsEntity = await this._auctionService.completeAuction();
      const settingsDTO: SettingsResponseDTO = mapSettingsEntityToResponseDTO(settings);
      response.status(HTTP_STATUS.OK).json(ApiResponse.success<SettingsResponseDTO>(AUCTION_MESSAGES.AUCTION_COMPLETED, settingsDTO));
    } catch (error: unknown) { next(error); }
  }

  async reopenAuction(_request: Request, response: Response, next: NextFunction): Promise<void> {
    try {
      const settings: SettingsEntity = await this._auctionService.reopenAuction();
      const settingsDTO: SettingsResponseDTO = mapSettingsEntityToResponseDTO(settings);
      response.status(HTTP_STATUS.OK).json(ApiResponse.success<SettingsResponseDTO>(AUCTION_MESSAGES.AUCTION_REOPENED, settingsDTO));
    } catch (error: unknown) { next(error); }
  }

}
