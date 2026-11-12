import type { RequestHandler } from "express";
import { asyncHandler } from "../../shared/utils/asyncHandler.js";
import { sendSuccess } from "../../shared/responses/response.helper.js";
import { MatchService } from "./match.service.js";
export class MatchController {
  constructor(private readonly service:MatchService){}
  list:RequestHandler=asyncHandler(async(req,res)=>{const r=await this.service.list(req.query as Record<string,unknown>);sendSuccess(res,r.items,"Matches fetched",200,{page:r.page,limit:r.limit,total:r.total,totalPages:Math.ceil(r.total/r.limit)});});
  get:RequestHandler=asyncHandler(async(req,res)=>sendSuccess(res,await this.service.get(String(req.params.id)),"Match fetched"));
  create:RequestHandler=asyncHandler(async(req,res)=>sendSuccess(res,await this.service.create(req.body as Record<string,unknown>),"Match created",201));
  update:RequestHandler=asyncHandler(async(req,res)=>sendSuccess(res,await this.service.update(String(req.params.id),req.body as Record<string,unknown>),"Match updated"));
  remove:RequestHandler=asyncHandler(async(req,res)=>sendSuccess(res,await this.service.delete(String(req.params.id)),"Match deleted"));
  addGoal:RequestHandler=asyncHandler(async(req,res)=>sendSuccess(res,await this.service.addGoal(String(req.params.id),req.body as Record<string,unknown>),"Goal added",201));
  updateGoal:RequestHandler=asyncHandler(async(req,res)=>sendSuccess(res,await this.service.updateGoal(String(req.params.id),String(req.params.goalId),req.body as Record<string,unknown>),"Goal updated"));
  deleteGoal:RequestHandler=asyncHandler(async(req,res)=>sendSuccess(res,await this.service.deleteGoal(String(req.params.id),String(req.params.goalId)),"Goal deleted"));
}
