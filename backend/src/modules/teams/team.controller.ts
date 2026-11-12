import type { RequestHandler } from "express";
import { asyncHandler } from "../../shared/utils/asyncHandler.js";
import { sendSuccess } from "../../shared/responses/response.helper.js";
import { TeamService } from "./team.service.js";
import { StatisticsService } from "../statistics/statistics.service.js";
import { teamCreateSchema, teamQuerySchema, teamUpdateSchema } from "./team.dto.js";
export class TeamController {
  constructor(private readonly teamService: TeamService, private readonly statisticsService: StatisticsService) {}
  getTeams: RequestHandler = asyncHandler(async (req, res) => {
    const result = await this.teamService.getTeams(teamQuerySchema.parse(req.query), Boolean(req.user));
    sendSuccess(res, result.items, "Teams fetched", 200, { page: result.page, limit: result.limit, total: result.total, totalPages: Math.ceil(result.total / result.limit) });
  });
  getTeamById: RequestHandler = asyncHandler(async (req, res) => sendSuccess(res, await this.teamService.getTeamById(String(req.params.id)), "Team fetched"));
  getAuctionSummary: RequestHandler = asyncHandler(async (_req, res) => sendSuccess(res, await this.teamService.getAuctionSummary(), "Auction summary fetched"));
  getTeamStatistics: RequestHandler = asyncHandler(async (req, res) => sendSuccess(res, await this.statisticsService.getTeamStatistics(String(req.params.id)), "Team statistics fetched"));
  createTeam: RequestHandler = asyncHandler(async (req, res) => sendSuccess(res, await this.teamService.createTeam(teamCreateSchema.parse(req.body)), "Team created", 201));
  updateTeam: RequestHandler = asyncHandler(async (req, res) => sendSuccess(res, await this.teamService.updateTeam(String(req.params.id), teamUpdateSchema.parse(req.body)), "Team updated"));
  deleteTeam: RequestHandler = asyncHandler(async (req, res) => { await this.teamService.deleteTeam(String(req.params.id)); sendSuccess(res, null, "Team deleted"); });
}
