import type { RequestHandler } from "express";
import { asyncHandler } from "../../shared/utils/asyncHandler.js";
import { sendSuccess } from "../../shared/responses/response.helper.js";
import { StatisticsService } from "./statistics.service.js";
export class StatisticsController {
  constructor(private readonly _statisticsService:StatisticsService){}
  dashboard:RequestHandler=asyncHandler(async(_req,res)=>sendSuccess(res,await this._statisticsService.getDashboardStatistics(),"Dashboard fetched"));
  standings:RequestHandler=asyncHandler(async(_req,res)=>sendSuccess(res,await this._statisticsService.getStandings(),"Standings fetched"));
  topScorers:RequestHandler=asyncHandler(async(_req,res)=>sendSuccess(res,await this._statisticsService.getTopScorers(),"Top scorers fetched"));
}
