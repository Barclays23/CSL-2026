import type { RequestHandler } from "express";
import { asyncHandler } from "../../shared/utils/asyncHandler.js";
import { sendSuccess } from "../../shared/responses/response.helper.js";
import type { IMatchController, IMatchService } from "./match.types.js";
import {
  goalSchema,
  matchCreateSchema,
  matchQuerySchema,
  matchUpdateSchema,
} from "./match.dto.js";

export class MatchController implements IMatchController {
  constructor(private readonly matchService: IMatchService) {}

  getMatches: RequestHandler = asyncHandler(async (request, response) => {
    const query = matchQuerySchema.parse(request.query);
    const result = await this.matchService.getMatches(query);
    sendSuccess(response, result.items, "Matches fetched", 200, {
      page: result.page,
      limit: result.limit,
      total: result.total,
      totalPages: Math.ceil(result.total / result.limit),
    });
  });

  getMatchById: RequestHandler = asyncHandler(async (request, response) => {
    const match = await this.matchService.getMatchById(String(request.params.id));
    sendSuccess(response, match, "Match fetched");
  });

  createMatch: RequestHandler = asyncHandler(async (request, response) => {
    const input = matchCreateSchema.parse(request.body);
    const match = await this.matchService.createMatch(input);
    sendSuccess(response, match, "Match created", 201);
  });

  updateMatch: RequestHandler = asyncHandler(async (request, response) => {
    const input = matchUpdateSchema.parse(request.body);
    const match = await this.matchService.updateMatch(String(request.params.id), input);
    sendSuccess(response, match, "Match updated");
  });

  deleteMatch: RequestHandler = asyncHandler(async (request, response) => {
    await this.matchService.deleteMatch(String(request.params.id));
    sendSuccess(response, null, "Match deleted");
  });

  addGoalToMatch: RequestHandler = asyncHandler(async (request, response) => {
    const input = goalSchema.parse(request.body);
    const match = await this.matchService.addGoalToMatch(String(request.params.id), input);
    sendSuccess(response, match, "Goal added", 201);
  });

  updateMatchGoal: RequestHandler = asyncHandler(async (request, response) => {
    const input = goalSchema.parse(request.body);
    const match = await this.matchService.updateMatchGoal(
      String(request.params.id),
      String(request.params.goalId),
      input,
    );
    sendSuccess(response, match, "Goal updated");
  });

  deleteMatchGoal: RequestHandler = asyncHandler(async (request, response) => {
    const match = await this.matchService.deleteMatchGoal(
      String(request.params.id),
      String(request.params.goalId),
    );
    sendSuccess(response, match, "Goal deleted");
  });
}
