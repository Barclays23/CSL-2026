import type { Request, Response, NextFunction } from "express";
import { ApiResponse } from "../../utils/apiResponse.utils.js";
import { HTTP_STATUS } from "../../shared/constants/http-status.constants.js";
import { STATISTICS_MESSAGES } from "../../shared/constants/messages.constants.js";
import type { IStatisticsController, IStatisticsService, DashboardSummaryDTO, GroupStandingDTO, TopScorerDTO, TeamStatisticsDTO } from "./statistics.types.js";

export class StatisticsController implements IStatisticsController {
  constructor(private readonly _statisticsService: IStatisticsService) {
    this.getDashboardStatistics = this.getDashboardStatistics.bind(this);
    this.getGroupStandings = this.getGroupStandings.bind(this);
    this.getTopScorers = this.getTopScorers.bind(this);
  }

  async getDashboardStatistics(_request: Request, response: Response, next: NextFunction): Promise<void> {
    try {
      const dashboard: DashboardSummaryDTO = await this._statisticsService.getDashboardStatistics();
      response.status(HTTP_STATUS.OK).json(ApiResponse.success<DashboardSummaryDTO>(STATISTICS_MESSAGES.DASHBOARD_FETCHED, dashboard));
    } catch (error: unknown) { next(error); }
  }

  async getGroupStandings(_request: Request, response: Response, next: NextFunction): Promise<void> {
    try {
      const standings: GroupStandingDTO[] = await this._statisticsService.getGroupStandings();
      response.status(HTTP_STATUS.OK).json(ApiResponse.success<GroupStandingDTO[]>(STATISTICS_MESSAGES.GROUP_STANDINGS_FETCHED, standings));
    } catch (error: unknown) { next(error); }
  }

  async getTopScorers(_request: Request, response: Response, next: NextFunction): Promise<void> {
    try {
      const topScorers: TopScorerDTO[] = await this._statisticsService.getTopScorers();
      response.status(HTTP_STATUS.OK).json(ApiResponse.success<TopScorerDTO[]>(STATISTICS_MESSAGES.TOP_SCORERS_FETCHED, topScorers));
    } catch (error: unknown) { next(error); }
  }
}
