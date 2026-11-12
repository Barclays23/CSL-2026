import type { Request, Response, NextFunction } from "express";
import { ApiResponse } from "../../utils/apiResponse.utils.js";
import { HTTP_STATUS } from "../../shared/constants/http-status.constants.js";
import { getRequiredRouteParam } from "../../shared/utils/routeParams.js";
import { PLAYER_MESSAGES } from "../../shared/constants/messages.constants.js";
import type { PaginatedResult } from "../../shared/types/common.types.js";
import type {
  IPlayerController,
  IPlayerService,
  PlayerResponseDTO,
  PlayerAdminDTO,
} from "./player.types.js";
import {
  playerAssignmentSchema,
  playerCreateSchema,
  playerQuerySchema,
  playerUpdateSchema,
  type PlayerAssignmentInput,
  type PlayerCreateInput,
  type PlayerQueryInput,
  type PlayerUpdateInput,
} from "./player.dto.js";





export class PlayerController implements IPlayerController {
  constructor(private readonly _playerService: IPlayerService) {}

  getPlayers = async (
    request: Request,
    response: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const query: PlayerQueryInput = playerQuerySchema.parse(request.query);
      const result: PaginatedResult<PlayerResponseDTO> =
        await this._playerService.getPlayers(query, Boolean(request.user));
      response
        .status(HTTP_STATUS.OK)
        .json(
          ApiResponse.success<PlayerResponseDTO[]>(
            PLAYER_MESSAGES.PLAYERS_FETCHED,
            result.items,
            result.pagination,
          ),
        );
    } catch (error: unknown) {
      next(error);
    }
  };

  getPlayerById = async (
    request: Request,
    response: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const playerId: string = getRequiredRouteParam(request.params.id, "id");
      const player: PlayerResponseDTO =
        await this._playerService.getPlayerById(
          playerId,
          Boolean(request.user),
        );
      response
        .status(HTTP_STATUS.OK)
        .json(
          ApiResponse.success<PlayerResponseDTO>(
            PLAYER_MESSAGES.PLAYER_FETCHED,
            player,
          ),
        );
    } catch (error: unknown) {
      next(error);
    }
  };

  createPlayer = async (
    request: Request,
    response: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const input: PlayerCreateInput = playerCreateSchema.parse(request.body);
      const player: PlayerAdminDTO =
        await this._playerService.createPlayer(input);
      response
        .status(HTTP_STATUS.CREATED)
        .json(ApiResponse.success(PLAYER_MESSAGES.PLAYER_CREATED, player));
    } catch (error: unknown) {
      next(error);
    }
  };

  updatePlayer = async (
    request: Request,
    response: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const playerId: string = getRequiredRouteParam(request.params.id, "id");
      const input: PlayerUpdateInput = playerUpdateSchema.parse(request.body);
      const player: PlayerAdminDTO = await this._playerService.updatePlayer(
        playerId,
        input,
      );
      response
        .status(HTTP_STATUS.OK)
        .json(ApiResponse.success(PLAYER_MESSAGES.PLAYER_UPDATED, player));
    } catch (error: unknown) {
      next(error);
    }
  };

  assignPlayerToTeam = async (
    request: Request,
    response: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const playerId: string = getRequiredRouteParam(request.params.id, "id");
      const input: PlayerAssignmentInput = playerAssignmentSchema.parse(
        request.body,
      );
      const player: PlayerAdminDTO =
        await this._playerService.assignPlayerToTeam(playerId, input);
      response
        .status(HTTP_STATUS.OK)
        .json(ApiResponse.success(PLAYER_MESSAGES.PLAYER_ASSIGNED, player));
    } catch (error: unknown) {
      next(error);
    }
  };

  markPlayerUnsold = async (
    request: Request,
    response: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const playerId: string = getRequiredRouteParam(request.params.id, "id");
      const player: PlayerAdminDTO =
        await this._playerService.markPlayerUnsold(playerId);
      response
        .status(HTTP_STATUS.OK)
        .json(ApiResponse.success(PLAYER_MESSAGES.PLAYER_MARKED_UNSOLD, player));
    } catch (error: unknown) {
      next(error);
    }
  };

  deactivatePlayer = async (
    request: Request,
    response: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const playerId: string = getRequiredRouteParam(request.params.id, "id");
      const player: PlayerAdminDTO =
        await this._playerService.deactivatePlayer(playerId);
      response
        .status(HTTP_STATUS.OK)
        .json(ApiResponse.success(PLAYER_MESSAGES.PLAYER_DEACTIVATED, player));
    } catch (error: unknown) {
      next(error);
    }
  };

  deletePlayer = async (
    request: Request,
    response: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const playerId: string = getRequiredRouteParam(request.params.id, "id");
      await this._playerService.deletePlayer(playerId);
      response
        .status(HTTP_STATUS.OK)
        .json(
          ApiResponse.success<null>(PLAYER_MESSAGES.PLAYER_DELETED, null),
        );
    } catch (error: unknown) {
      next(error);
    }
  };
}