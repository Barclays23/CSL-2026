import type { RequestHandler } from "express";
import { asyncHandler } from "../../shared/utils/asyncHandler.js";
import { sendSuccess } from "../../shared/responses/response.helper.js";
import { AuctionService } from "./auction.service.js";
export class AuctionController {
  constructor(private readonly service:AuctionService){}
  start:RequestHandler=asyncHandler(async(_req,res)=>sendSuccess(res,await this.service.start(),"Auction started"));
  complete:RequestHandler=asyncHandler(async(_req,res)=>sendSuccess(res,await this.service.complete(),"Auction completed"));
  reopen:RequestHandler=asyncHandler(async(_req,res)=>sendSuccess(res,await this.service.reopen(),"Auction reopened"));
}
