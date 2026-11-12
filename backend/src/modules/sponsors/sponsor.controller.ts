import type { RequestHandler } from "express";
import { asyncHandler } from "../../shared/utils/asyncHandler.js";
import { sendSuccess } from "../../shared/responses/response.helper.js";
import { SponsorService } from "./sponsor.service.js";
export class SponsorController {
  constructor(private readonly _sponsorService:SponsorService){}
  list:RequestHandler=asyncHandler(async(req,res)=>{const r=await this._sponsorService.list(req.query as Record<string,unknown>,Boolean(req.user));sendSuccess(res,r.items,"Sponsors fetched",200,{page:r.page,limit:r.limit,total:r.total,totalPages:Math.ceil(r.total/r.limit)});});
  get:RequestHandler=asyncHandler(async(req,res)=>sendSuccess(res,await this._sponsorService.get(String(req.params.id),Boolean(req.user)),"Sponsor fetched"));
  create:RequestHandler=asyncHandler(async(req,res)=>sendSuccess(res,await this._sponsorService.save(req.body as Record<string,unknown>),"Sponsor created",201));
  update:RequestHandler=asyncHandler(async(req,res)=>sendSuccess(res,await this._sponsorService.save(req.body as Record<string,unknown>,String(req.params.id)),"Sponsor updated"));
  remove:RequestHandler=asyncHandler(async(req,res)=>sendSuccess(res,await this._sponsorService.remove(String(req.params.id)),"Sponsor deleted"));
}
