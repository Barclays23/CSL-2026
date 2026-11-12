import type { RequestHandler } from "express";
import { asyncHandler } from "../../shared/utils/asyncHandler.js";
import { sendSuccess } from "../../shared/responses/response.helper.js";
import { ManagerService } from "./manager.service.js";
export class ManagerController {
  constructor(private readonly _managerService:ManagerService){}
  list:RequestHandler=asyncHandler(async(req,res)=>{const r=await this._managerService.list(req.query as Record<string,unknown>,Boolean(req.user));sendSuccess(res,r.items,"Managers fetched",200,{page:r.page,limit:r.limit,total:r.total,totalPages:Math.ceil(r.total/r.limit)});});
  get:RequestHandler=asyncHandler(async(req,res)=>sendSuccess(res,await this._managerService.get(String(req.params.id),Boolean(req.user)),"Manager fetched"));
  create:RequestHandler=asyncHandler(async(req,res)=>sendSuccess(res,await this._managerService.save(req.body as Record<string,unknown>),"Manager created",201));
  update:RequestHandler=asyncHandler(async(req,res)=>sendSuccess(res,await this._managerService.save(req.body as Record<string,unknown>,String(req.params.id)),"Manager updated"));
  remove:RequestHandler=asyncHandler(async(req,res)=>sendSuccess(res,await this._managerService.remove(String(req.params.id)),"Manager deleted"));
}
