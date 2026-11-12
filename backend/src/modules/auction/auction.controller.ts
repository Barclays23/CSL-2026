import type { RequestHandler } from "express";
import { asyncHandler } from "../../shared/utils/asyncHandler.js";
import { sendSuccess } from "../../shared/responses/response.helper.js";
import type { IAuctionController, IAuctionService } from "./auction.types.js";

export class AuctionController implements IAuctionController {
  constructor(private readonly auctionService: IAuctionService) {}

  startAuction: RequestHandler = asyncHandler(async (_request, response) => {
    const settings = await this.auctionService.startAuction();
    sendSuccess(response, settings, "Auction started");
  });

  completeAuction: RequestHandler = asyncHandler(async (_request, response) => {
    const settings = await this.auctionService.completeAuction();
    sendSuccess(response, settings, "Auction completed");
  });

  reopenAuction: RequestHandler = asyncHandler(async (_request, response) => {
    const settings = await this.auctionService.reopenAuction();
    sendSuccess(response, settings, "Auction reopened");
  });
}
