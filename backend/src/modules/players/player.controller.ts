import type { RequestHandler } from "express";
import { asyncHandler } from "../../shared/utils/asyncHandler.js";
import { sendSuccess } from "../../shared/responses/response.helper.js";
import { PlayerService } from "./player._playerService.js";
export class PlayerController {
  constructor(private readonly _playerService:PlayerService){}
  list:RequestHandler=asyncHandler(async(req,res)=>{const r=await this._playerService.list(req.query as Record<string,unknown>,Boolean(req.user));sendSuccess(res,r.items,"Players fetched",200,{page:r.page,limit:r.limit,total:r.total,totalPages:Math.ceil(r.total/r.limit)});});
  get:RequestHandler=asyncHandler(async(req,res)=>sendSuccess(res,await this._playerService.get(String(req.params.id),Boolean(req.user)),"Player fetched"));
  create:RequestHandler=asyncHandler(async(req,res)=>sendSuccess(res,await this._playerService.create(req.body as Record<string,unknown>),"Player created",201));
  update:RequestHandler=asyncHandler(async(req,res)=>sendSuccess(res,await this._playerService.update(String(req.params.id),req.body as Record<string,unknown>),"Player updated"));
  deactivate:RequestHandler=asyncHandler(async(req,res)=>sendSuccess(res,await this._playerService.deactivate(String(req.params.id)),"Player deactivated"));
  remove:RequestHandler=asyncHandler(async(req,res)=>sendSuccess(res,await this._playerService.remove(String(req.params.id)),"Player deleted"));
  assign:RequestHandler=asyncHandler(async(req,res)=>sendSuccess(res,await this._playerService.assign(String(req.params.id),req.body as {teamRef:string;auctionPrice:number;jerseyNo?:number|null}),"Player assigned"));
  unsold:RequestHandler=asyncHandler(async(req,res)=>sendSuccess(res,await this._playerService.markUnsold(String(req.params.id)),"Player marked unsold"));
}
