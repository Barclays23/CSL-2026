import type { Request, Response, NextFunction } from "express";
import { ApiResponse } from "../../utils/apiResponse.utils.js";
import { HTTP_STATUS } from "../../shared/constants/http-status.constants.js";
import { getRequiredRouteParam } from "../../shared/utils/routeParams.js";
import { TEAM_MESSAGES } from "../../shared/constants/messages.constants.js";
import type { PaginatedResult } from "../../shared/types/common.types.js";
import type { ITeamController, ITeamService, TeamDTO, TeamAuctionSummaryDTO } from "./team.types.js";
import type { IStatisticsService, TeamStatisticsDTO } from "../statistics/statistics.types.js";
import { teamCreateSchema, teamQuerySchema, teamUpdateSchema, type TeamCreateInput, type TeamQueryInput, type TeamUpdateInput } from "./team.dto.js";

export class TeamController implements ITeamController {
  constructor(
    private readonly _teamService: ITeamService,
    private readonly _statisticsService: IStatisticsService,
  ) {
    this.getTeams = this.getTeams.bind(this);
    this.getTeamById = this.getTeamById.bind(this);
    this.getTeamAuctionSummary = this.getTeamAuctionSummary.bind(this);
    this.getTeamStatistics = this.getTeamStatistics.bind(this);
    this.createTeam = this.createTeam.bind(this);
    this.updateTeam = this.updateTeam.bind(this);
    this.deleteTeam = this.deleteTeam.bind(this);
  }

  async getTeams(request: Request, response: Response, next: NextFunction): Promise<void> {
    try {
      const query: TeamQueryInput = teamQuerySchema.parse(request.query);
      const result: PaginatedResult<TeamDTO> = await this._teamService.getTeams(query, Boolean(request.user));
      response.status(HTTP_STATUS.OK).json(ApiResponse.success<TeamDTO[]>(TEAM_MESSAGES.TEAMS_FETCHED, result.items, result.pagination));
    } catch (error: unknown) { next(error); }
  }

  async getTeamById(request: Request, response: Response, next: NextFunction): Promise<void> {
    try {
      const teamId: string = getRequiredRouteParam(request.params.id, "id");
      const team: TeamDTO = await this._teamService.getTeamById(teamId);
      response.status(HTTP_STATUS.OK).json(ApiResponse.success<TeamDTO>(TEAM_MESSAGES.TEAM_FETCHED, team));
    } catch (error: unknown) { next(error); }
  }

  async getTeamAuctionSummary(_request: Request, response: Response, next: NextFunction): Promise<void> {
    try {
      const summary: TeamAuctionSummaryDTO = await this._teamService.getTeamAuctionSummary();
      response.status(HTTP_STATUS.OK).json(ApiResponse.success<TeamAuctionSummaryDTO>(TEAM_MESSAGES.AUCTION_SUMMARY_FETCHED, summary));
    } catch (error: unknown) { next(error); }
  }

  async getTeamStatistics(request: Request, response: Response, next: NextFunction): Promise<void> {
    try {
      const teamId: string = getRequiredRouteParam(request.params.id, "id");
      const statistics: TeamStatisticsDTO = await this._statisticsService.getTeamStatistics(teamId);
      response.status(HTTP_STATUS.OK).json(ApiResponse.success<TeamStatisticsDTO>(TEAM_MESSAGES.TEAM_STATISTICS_FETCHED, statistics));
    } catch (error: unknown) { next(error); }
  }

  async createTeam(request: Request, response: Response, next: NextFunction): Promise<void> {
    try {
      const input: TeamCreateInput = teamCreateSchema.parse(request.body);
      const team: TeamDTO = await this._teamService.createTeam(input);
      response.status(HTTP_STATUS.CREATED).json(ApiResponse.success<TeamDTO>(TEAM_MESSAGES.TEAM_CREATED, team));
    } catch (error: unknown) { next(error); }
  }

  async updateTeam(request: Request, response: Response, next: NextFunction): Promise<void> {
    try {
      const teamId: string = getRequiredRouteParam(request.params.id, "id");
      const input: TeamUpdateInput = teamUpdateSchema.parse(request.body);
      const team: TeamDTO = await this._teamService.updateTeam(teamId, input);
      response.status(HTTP_STATUS.OK).json(ApiResponse.success<TeamDTO>(TEAM_MESSAGES.TEAM_UPDATED, team));
    } catch (error: unknown) { next(error); }
  }

  async deleteTeam(request: Request, response: Response, next: NextFunction): Promise<void> {
    try {
      const teamId: string = getRequiredRouteParam(request.params.id, "id");
      await this._teamService.deleteTeam(teamId);
      response.status(HTTP_STATUS.OK).json(ApiResponse.success<null>(TEAM_MESSAGES.TEAM_DELETED, null));
    } catch (error: unknown) { next(error); }
  }
}
