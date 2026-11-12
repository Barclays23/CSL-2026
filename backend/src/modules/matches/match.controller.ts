import type { Request, Response, NextFunction } from "express";
import { ApiResponse } from "../../utils/apiResponse.utils.js";
import { HTTP_STATUS } from "../../shared/constants/http-status.constants.js";
import { MATCH_MESSAGES } from "../../shared/constants/messages.constants.js";
import type { PaginatedResult } from "../../shared/types/common.types.js";
import type { IMatchController, IMatchService, MatchResponseDTO } from "./match.types.js";
import { goalSchema, matchCreateSchema, matchQuerySchema, matchUpdateSchema, type GoalInput, type MatchCreateInput, type MatchQueryInput, type MatchUpdateInput } from "./match.dto.js";

export class MatchController implements IMatchController {
  constructor(private readonly _matchService: IMatchService) {
    this.getMatches = this.getMatches.bind(this);
    this.getMatchById = this.getMatchById.bind(this);
    this.createMatch = this.createMatch.bind(this);
    this.updateMatch = this.updateMatch.bind(this);
    this.deleteMatch = this.deleteMatch.bind(this);
    this.addGoalToMatch = this.addGoalToMatch.bind(this);
    this.updateMatchGoal = this.updateMatchGoal.bind(this);
    this.deleteMatchGoal = this.deleteMatchGoal.bind(this);
  }

  async getMatches(request: Request, response: Response, next: NextFunction): Promise<void> {
    try {
      const query: MatchQueryInput = matchQuerySchema.parse(request.query);
      const result: PaginatedResult<MatchResponseDTO> = await this._matchService.getMatches(query);
      response.status(HTTP_STATUS.OK).json(ApiResponse.success<MatchResponseDTO[]>(MATCH_MESSAGES.MATCHES_FETCHED, result.items, result.pagination));
    } catch (error: unknown) { next(error); }
  }

  async getMatchById(request: Request, response: Response, next: NextFunction): Promise<void> {
    try {
      const matchId: string = request.params.id;
      const match: MatchResponseDTO = await this._matchService.getMatchById(matchId);
      response.status(HTTP_STATUS.OK).json(ApiResponse.success<MatchResponseDTO>(MATCH_MESSAGES.MATCH_FETCHED, match));
    } catch (error: unknown) { next(error); }
  }

  async createMatch(request: Request, response: Response, next: NextFunction): Promise<void> {
    try {
      const input: MatchCreateInput = matchCreateSchema.parse(request.body);
      const match: MatchResponseDTO = await this._matchService.createMatch(input);
      response.status(HTTP_STATUS.CREATED).json(ApiResponse.success<MatchResponseDTO>(MATCH_MESSAGES.MATCH_CREATED, match));
    } catch (error: unknown) { next(error); }
  }

  async updateMatch(request: Request, response: Response, next: NextFunction): Promise<void> {
    try {
      const matchId: string = request.params.id;
      const input: MatchUpdateInput = matchUpdateSchema.parse(request.body);
      const match: MatchResponseDTO = await this._matchService.updateMatch(matchId, input);
      response.status(HTTP_STATUS.OK).json(ApiResponse.success<MatchResponseDTO>(MATCH_MESSAGES.MATCH_UPDATED, match));
    } catch (error: unknown) { next(error); }
  }

  async deleteMatch(request: Request, response: Response, next: NextFunction): Promise<void> {
    try {
      const matchId: string = request.params.id;
      await this._matchService.deleteMatch(matchId);
      response.status(HTTP_STATUS.OK).json(ApiResponse.success<null>(MATCH_MESSAGES.MATCH_DELETED, null));
    } catch (error: unknown) { next(error); }
  }

  async addGoalToMatch(request: Request, response: Response, next: NextFunction): Promise<void> {
    try {
      const matchId: string = request.params.id;
      const input: GoalInput = goalSchema.parse(request.body);
      const match: MatchResponseDTO = await this._matchService.addGoalToMatch(matchId, input);
      response.status(HTTP_STATUS.CREATED).json(ApiResponse.success<MatchResponseDTO>(MATCH_MESSAGES.GOAL_CREATED, match));
    } catch (error: unknown) { next(error); }
  }

  async updateMatchGoal(request: Request, response: Response, next: NextFunction): Promise<void> {
    try {
      const matchId: string = request.params.id;
      const goalId: string = request.params.goalId;
      const input: GoalInput = goalSchema.parse(request.body);
      const match: MatchResponseDTO = await this._matchService.updateMatchGoal(matchId, goalId, input);
      response.status(HTTP_STATUS.OK).json(ApiResponse.success<MatchResponseDTO>(MATCH_MESSAGES.GOAL_UPDATED, match));
    } catch (error: unknown) { next(error); }
  }

  async deleteMatchGoal(request: Request, response: Response, next: NextFunction): Promise<void> {
    try {
      const matchId: string = request.params.id;
      const goalId: string = request.params.goalId;
      const match: MatchResponseDTO = await this._matchService.deleteMatchGoal(matchId, goalId);
      response.status(HTTP_STATUS.OK).json(ApiResponse.success<MatchResponseDTO>(MATCH_MESSAGES.GOAL_DELETED, match));
    } catch (error: unknown) { next(error); }
  }
}
