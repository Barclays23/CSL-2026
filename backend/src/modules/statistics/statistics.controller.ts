import type { RequestHandler } from "express";
import { asyncHandler } from "../../shared/utils/asyncHandler.js";
import { sendSuccess } from "../../shared/responses/response.helper.js";
import type { IStatisticsController, IStatisticsService } from "./statistics.types.js";

export class StatisticsController implements IStatisticsController {
  constructor(private readonly statisticsService: IStatisticsService) {}

  getDashboardStatistics: RequestHandler = asyncHandler(async (_request, response) => {
    const dashboard = await this.statisticsService.getDashboardStatistics();
    sendSuccess(response, dashboard, "Dashboard statistics fetched");
  });

  getGroupStandings: RequestHandler = asyncHandler(async (_request, response) => {
    const standings = await this.statisticsService.getGroupStandings();
    sendSuccess(response, standings, "Group standings fetched");
  });

  getTopScorers: RequestHandler = asyncHandler(async (_request, response) => {
    const topScorers = await this.statisticsService.getTopScorers();
    sendSuccess(response, topScorers, "Top scorers fetched");
  });
}
