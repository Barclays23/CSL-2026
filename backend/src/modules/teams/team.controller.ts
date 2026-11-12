import type { RequestHandler } from "express";
import { asyncHandler } from "../../shared/utils/asyncHandler.js";
import { sendSuccess } from "../../shared/responses/response.helper.js";
import { TeamService } from "./team.service.js";
import { StatisticsService } from "../statistics/statistics.service.js";
export class TeamController {
  constructor(private readonly service:TeamService,private readonly statistics:StatisticsService){}
  list:RequestHandler=asyncHandler(async(req,res)=>{const r=await this.service.list(req.query as Record<string,unknown>,Boolean(req.user));sendSuccess(res,r.items,"Teams fetched",200,{page:r.page,limit:r.limit,total:r.total,totalPages:Math.ceil(r.total/r.limit)});});
  get:RequestHandler=asyncHandler(async(req,res)=>sendSuccess(res,await this.service.get(String(req.params.id)),"Team fetched"));
  auctionSummary:RequestHandler=asyncHandler(async(_req,res)=>sendSuccess(res,await this.service.auctionSummary(),"Auction summary fetched"));
  stats:RequestHandler=asyncHandler(async(req,res)=>{const result=await this.statistics.getTeamStatistics(String(req.params.id));sendSuccess(res,result,"Team statistics fetched");});
  create:RequestHandler=asyncHandler(async(req,res)=>sendSuccess(res,await this.service.create(req.body as Record<string,unknown>),"Team created",201));
  update:RequestHandler=asyncHandler(async(req,res)=>sendSuccess(res,await this.service.update(String(req.params.id),req.body as Record<string,unknown>),"Team updated"));
  remove:RequestHandler=asyncHandler(async(req,res)=>sendSuccess(res,await this.service.remove(String(req.params.id)),"Team deleted"));
}
