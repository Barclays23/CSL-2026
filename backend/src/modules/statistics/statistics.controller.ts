import type { RequestHandler } from "express";
import { asyncHandler } from "../../shared/utils/asyncHandler.js";
import { sendSuccess } from "../../shared/responses/response.helper.js";
import { StatisticsService } from "./statistics.service.js";
export class StatisticsController {
  constructor(private readonly service:StatisticsService){}
  dashboard:RequestHandler=asyncHandler(async(_req,res)=>sendSuccess(res,await this.service.getDashboardStatistics(),"Dashboard fetched"));
  standings:RequestHandler=asyncHandler(async(_req,res)=>sendSuccess(res,await this.service.getStandings(),"Standings fetched"));
  topScorers:RequestHandler=asyncHandler(async(_req,res)=>sendSuccess(res,await this.service.getTopScorers(),"Top scorers fetched"));
}
