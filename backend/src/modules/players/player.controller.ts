import type { RequestHandler } from "express";
import { asyncHandler } from "../../shared/utils/asyncHandler.js";
import { sendSuccess } from "../../shared/responses/response.helper.js";
import { PlayerService } from "./player.service.js";
import { assignPlayerSchema, playerCreateSchema, playerQuerySchema, playerUpdateSchema } from "./player.dto.js";
export class PlayerController {
  constructor(private readonly playerService: PlayerService) {}
  getPlayers: RequestHandler = asyncHandler(async (req, res) => {
    const query = playerQuerySchema.parse(req.query);
    const result = await this.playerService.getPlayers(query, Boolean(req.user));
    sendSuccess(res, result.items, "Players fetched", 200, { page: result.page, limit: result.limit, total: result.total, totalPages: Math.ceil(result.total / result.limit) });
  });
  getPlayerById: RequestHandler = asyncHandler(async (req, res) => sendSuccess(res, await this.playerService.getPlayerById(String(req.params.id), Boolean(req.user)), "Player fetched"));
  createPlayer: RequestHandler = asyncHandler(async (req, res) => sendSuccess(res, await this.playerService.createPlayer(playerCreateSchema.parse(req.body)), "Player created", 201));
  updatePlayer: RequestHandler = asyncHandler(async (req, res) => sendSuccess(res, await this.playerService.updatePlayer(String(req.params.id), playerUpdateSchema.parse(req.body)), "Player updated"));
  deactivatePlayer: RequestHandler = asyncHandler(async (req, res) => sendSuccess(res, await this.playerService.deactivatePlayer(String(req.params.id)), "Player deactivated"));
  deletePlayer: RequestHandler = asyncHandler(async (req, res) => { await this.playerService.deletePlayer(String(req.params.id)); sendSuccess(res, null, "Player deleted"); });
  assignPlayerToTeam: RequestHandler = asyncHandler(async (req, res) => sendSuccess(res, await this.playerService.assignPlayerToTeam(String(req.params.id), assignPlayerSchema.parse(req.body)), "Player assigned"));
  markPlayerUnsold: RequestHandler = asyncHandler(async (req, res) => sendSuccess(res, await this.playerService.markPlayerUnsold(String(req.params.id)), "Player marked unsold"));
}
