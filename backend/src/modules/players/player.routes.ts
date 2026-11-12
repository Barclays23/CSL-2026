import { Router } from "express";
import { authenticate } from "../../middlewares/authenticate.middleware.js";
import { optionalAuthenticate } from "../../middlewares/optionalAuthenticate.middleware.js";
import { requireAdmin } from "../../middlewares/authorizeAdmin.middleware.js";
import { validate } from "../../middlewares/validate.middleware.js";
import { controllers } from "../../container/index.js";
import {
  playerAssignmentSchema,
  playerCreateSchema,
  playerQuerySchema,
  playerUpdateSchema,
} from "./player.dto.js";

export const playerRouter = Router();

playerRouter.get("/", optionalAuthenticate, validate(playerQuerySchema, "query"), controllers.players.getPlayers);
playerRouter.get("/:id", optionalAuthenticate, controllers.players.getPlayerById);
playerRouter.post("/", authenticate, requireAdmin, validate(playerCreateSchema), controllers.players.createPlayer);
playerRouter.patch("/:id", authenticate, requireAdmin, validate(playerUpdateSchema), controllers.players.updatePlayer);
playerRouter.patch("/:id/assign", authenticate, requireAdmin, validate(playerAssignmentSchema), controllers.players.assignPlayerToTeam);
playerRouter.patch("/:id/unsold", authenticate, requireAdmin, controllers.players.markPlayerUnsold);
playerRouter.patch("/:id/deactivate", authenticate, requireAdmin, controllers.players.deactivatePlayer);
playerRouter.delete("/:id", authenticate, requireAdmin, controllers.players.deletePlayer);
