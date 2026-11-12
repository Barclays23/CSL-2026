import type { RequestHandler } from "express";
import { asyncHandler } from "../../shared/utils/asyncHandler.js";
import { sendSuccess } from "../../shared/responses/response.helper.js";
import { PlayerService } from "./player.service.js";
export class PlayerController {
  constructor(private readonly service:PlayerService){}
  list:RequestHandler=asyncHandler(async(req,res)=>{const r=await this.service.list(req.query as Record<string,unknown>,Boolean(req.user));sendSuccess(res,r.items,"Players fetched",200,{page:r.page,limit:r.limit,total:r.total,totalPages:Math.ceil(r.total/r.limit)});});
  get:RequestHandler=asyncHandler(async(req,res)=>sendSuccess(res,await this.service.get(String(req.params.id),Boolean(req.user)),"Player fetched"));
  create:RequestHandler=asyncHandler(async(req,res)=>sendSuccess(res,await this.service.create(req.body as Record<string,unknown>),"Player created",201));
  update:RequestHandler=asyncHandler(async(req,res)=>sendSuccess(res,await this.service.update(String(req.params.id),req.body as Record<string,unknown>),"Player updated"));
  deactivate:RequestHandler=asyncHandler(async(req,res)=>sendSuccess(res,await this.service.deactivate(String(req.params.id)),"Player deactivated"));
  remove:RequestHandler=asyncHandler(async(req,res)=>sendSuccess(res,await this.service.remove(String(req.params.id)),"Player deleted"));
  assign:RequestHandler=asyncHandler(async(req,res)=>sendSuccess(res,await this.service.assign(String(req.params.id),req.body as {teamRef:string;auctionPrice:number;jerseyNo?:number|null}),"Player assigned"));
  unsold:RequestHandler=asyncHandler(async(req,res)=>sendSuccess(res,await this.service.markUnsold(String(req.params.id)),"Player marked unsold"));
}
