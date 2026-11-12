import type { RequestHandler } from "express";
import { asyncHandler } from "../../shared/utils/asyncHandler.js";
import { sendSuccess } from "../../shared/responses/response.helper.js";
import type { IAuctionController, IAuctionService } from "./auction.types.js";
import { mapSettingsEntityToResponseDTO } from "../settings/settings.mapper.js";

export class AuctionController implements IAuctionController {
  constructor(private readonly auctionService: IAuctionService) {}

  startAuction: RequestHandler = asyncHandler(async (_request, response) => {
    const settings = await this.auctionService.startAuction();
    sendSuccess(response, mapSettingsEntityToResponseDTO(settings), "Auction started");
  });

  completeAuction: RequestHandler = asyncHandler(async (_request, response) => {
    const settings = await this.auctionService.completeAuction();
    sendSuccess(response, mapSettingsEntityToResponseDTO(settings), "Auction completed");
  });

  reopenAuction: RequestHandler = asyncHandler(async (_request, response) => {
    const settings = await this.auctionService.reopenAuction();
    sendSuccess(response, mapSettingsEntityToResponseDTO(settings), "Auction reopened");
  });
}
