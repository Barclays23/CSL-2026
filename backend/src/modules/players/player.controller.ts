import type { RequestHandler } from "express";
import { asyncHandler } from "../../shared/utils/asyncHandler.js";
import { sendSuccess } from "../../shared/responses/response.helper.js";
import type { IPlayerController, IPlayerService } from "./player.types.js";
import {
  playerAssignmentSchema,
  playerCreateSchema,
  playerQuerySchema,
  playerUpdateSchema,
} from "./player.dto.js";

export class PlayerController implements IPlayerController {
  constructor(private readonly playerService: IPlayerService) {}

  getPlayers: RequestHandler = asyncHandler(async (request, response) => {
    const query = playerQuerySchema.parse(request.query);
    const result = await this.playerService.getPlayers(query, Boolean(request.user));
    sendSuccess(response, result.items, "Players fetched", 200, {
      page: result.page,
      limit: result.limit,
      total: result.total,
      totalPages: Math.ceil(result.total / result.limit),
    });
  });

  getPlayerById: RequestHandler = asyncHandler(async (request, response) => {
    const player = await this.playerService.getPlayerById(String(request.params.id), Boolean(request.user));
    sendSuccess(response, player, "Player fetched");
  });

  createPlayer: RequestHandler = asyncHandler(async (request, response) => {
    const input = playerCreateSchema.parse(request.body);
    const player = await this.playerService.createPlayer(input);
    sendSuccess(response, player, "Player created", 201);
  });

  updatePlayer: RequestHandler = asyncHandler(async (request, response) => {
    const input = playerUpdateSchema.parse(request.body);
    const player = await this.playerService.updatePlayer(String(request.params.id), input);
    sendSuccess(response, player, "Player updated");
  });

  assignPlayerToTeam: RequestHandler = asyncHandler(async (request, response) => {
    const input = playerAssignmentSchema.parse(request.body);
    const player = await this.playerService.assignPlayerToTeam(String(request.params.id), input);
    sendSuccess(response, player, "Player assigned to team");
  });

  markPlayerUnsold: RequestHandler = asyncHandler(async (request, response) => {
    const player = await this.playerService.markPlayerUnsold(String(request.params.id));
    sendSuccess(response, player, "Player marked unsold");
  });

  deactivatePlayer: RequestHandler = asyncHandler(async (request, response) => {
    const player = await this.playerService.deactivatePlayer(String(request.params.id));
    sendSuccess(response, player, "Player deactivated");
  });

  deletePlayer: RequestHandler = asyncHandler(async (request, response) => {
    await this.playerService.deletePlayer(String(request.params.id));
    sendSuccess(response, null, "Player deleted");
  });
}
