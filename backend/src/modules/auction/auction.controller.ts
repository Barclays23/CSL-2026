import type { RequestHandler } from "express";
import { asyncHandler } from "../../shared/utils/asyncHandler.js";
import { sendSuccess } from "../../shared/responses/response.helper.js";
import { AuctionService } from "./auction.service.js";
export class AuctionController {
  constructor(private readonly auctionService: AuctionService) {}
  startAuction: RequestHandler = asyncHandler(async (_req, res) => sendSuccess(res, await this.auctionService.startAuction(), "Auction started"));
  completeAuction: RequestHandler = asyncHandler(async (_req, res) => sendSuccess(res, await this.auctionService.completeAuction(), "Auction completed"));
  reopenAuction: RequestHandler = asyncHandler(async (_req, res) => sendSuccess(res, await this.auctionService.reopenAuction(), "Auction reopened"));
}
