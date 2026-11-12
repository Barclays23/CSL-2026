import type { RequestHandler } from "express";
import { asyncHandler } from "../../shared/utils/asyncHandler.js";
import { sendSuccess } from "../../shared/responses/response.helper.js";
import { MatchService } from "./match.service.js";
export class MatchController {
  constructor(private readonly _matchService:MatchService){}
  list:RequestHandler=asyncHandler(async(req,res)=>{const r=await this._matchService.list(req.query as Record<string,unknown>);sendSuccess(res,r.items,"Matches fetched",200,{page:r.page,limit:r.limit,total:r.total,totalPages:Math.ceil(r.total/r.limit)});});
  get:RequestHandler=asyncHandler(async(req,res)=>sendSuccess(res,await this._matchService.get(String(req.params.id)),"Match fetched"));
  create:RequestHandler=asyncHandler(async(req,res)=>sendSuccess(res,await this._matchService.create(req.body as Record<string,unknown>),"Match created",201));
  update:RequestHandler=asyncHandler(async(req,res)=>sendSuccess(res,await this._matchService.update(String(req.params.id),req.body as Record<string,unknown>),"Match updated"));
  remove:RequestHandler=asyncHandler(async(req,res)=>sendSuccess(res,await this._matchService.delete(String(req.params.id)),"Match deleted"));
  addGoal:RequestHandler=asyncHandler(async(req,res)=>sendSuccess(res,await this._matchService.addGoal(String(req.params.id),req.body as Record<string,unknown>),"Goal added",201));
  updateGoal:RequestHandler=asyncHandler(async(req,res)=>sendSuccess(res,await this._matchService.updateGoal(String(req.params.id),String(req.params.goalId),req.body as Record<string,unknown>),"Goal updated"));
  deleteGoal:RequestHandler=asyncHandler(async(req,res)=>sendSuccess(res,await this._matchService.deleteGoal(String(req.params.id),String(req.params.goalId)),"Goal deleted"));
}
