import type { RequestHandler } from "express";
import { asyncHandler } from "../../shared/utils/asyncHandler.js";
import { sendSuccess } from "../../shared/responses/response.helper.js";
import type { ITeamController, ITeamService } from "./team.types.js";
import type { IStatisticsService } from "../statistics/statistics.types.js";
import { teamCreateSchema, teamQuerySchema, teamUpdateSchema } from "./team.dto.js";

export class TeamController implements ITeamController {
  constructor(
    private readonly teamService: ITeamService,
    private readonly statisticsService: IStatisticsService,
  ) {}

  getTeams: RequestHandler = asyncHandler(async (request, response) => {
    const query = teamQuerySchema.parse(request.query);
    const result = await this.teamService.getTeams(query, Boolean(request.user));
    sendSuccess(response, result.items, "Teams fetched", 200, {
      page: result.page,
      limit: result.limit,
      total: result.total,
      totalPages: Math.ceil(result.total / result.limit),
    });
  });

  getTeamById: RequestHandler = asyncHandler(async (request, response) => {
    const team = await this.teamService.getTeamById(String(request.params.id));
    sendSuccess(response, team, "Team fetched");
  });

  getTeamAuctionSummary: RequestHandler = asyncHandler(async (_request, response) => {
    const summary = await this.teamService.getTeamAuctionSummary();
    sendSuccess(response, summary, "Auction summary fetched");
  });

  getTeamStatistics: RequestHandler = asyncHandler(async (request, response) => {
    const statistics = await this.statisticsService.getTeamStatistics(String(request.params.id));
    sendSuccess(response, statistics, "Team statistics fetched");
  });

  createTeam: RequestHandler = asyncHandler(async (request, response) => {
    const input = teamCreateSchema.parse(request.body);
    const team = await this.teamService.createTeam(input);
    sendSuccess(response, team, "Team created", 201);
  });

  updateTeam: RequestHandler = asyncHandler(async (request, response) => {
    const input = teamUpdateSchema.parse(request.body);
    const team = await this.teamService.updateTeam(String(request.params.id), input);
    sendSuccess(response, team, "Team updated");
  });

  deleteTeam: RequestHandler = asyncHandler(async (request, response) => {
    await this.teamService.deleteTeam(String(request.params.id));
    sendSuccess(response, null, "Team deleted");
  });
}
