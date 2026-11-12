import type { RequestHandler } from "express";
import { asyncHandler } from "../../shared/utils/asyncHandler.js";
import { sendSuccess } from "../../shared/responses/response.helper.js";
import { AuctionService } from "./auction.service.js";
export class AuctionController {
  constructor(private readonly _auctionService:AuctionService){}
  start:RequestHandler=asyncHandler(async(_req,res)=>sendSuccess(res,await this._auctionService.start(),"Auction started"));
  complete:RequestHandler=asyncHandler(async(_req,res)=>sendSuccess(res,await this._auctionService.complete(),"Auction completed"));
  reopen:RequestHandler=asyncHandler(async(_req,res)=>sendSuccess(res,await this._auctionService.reopen(),"Auction reopened"));
}
