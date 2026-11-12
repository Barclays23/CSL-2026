import { Router } from "express";
import { authenticate } from "../../middlewares/authenticate.middleware.js";
import { optionalAuthenticate } from "../../middlewares/optionalAuthenticate.middleware.js";
import { requireAdmin } from "../../middlewares/authorizeAdmin.middleware.js";
import { validate } from "../../middlewares/validate.middleware.js";
import { playerController } from "../../container/dependencies.js";
import {
  playerAssignmentSchema,
  playerCreateSchema,
  playerQuerySchema,
  playerUpdateSchema,
} from "./player.dto.js";




export const playerRouter = Router();




playerRouter.get("/", optionalAuthenticate, validate(playerQuerySchema, "query"), playerController.getPlayers);
playerRouter.get("/:id", optionalAuthenticate, playerController.getPlayerById);
playerRouter.post("/", authenticate, requireAdmin, validate(playerCreateSchema), playerController.createPlayer);
playerRouter.patch("/:id", authenticate, requireAdmin, validate(playerUpdateSchema), playerController.updatePlayer);
playerRouter.patch("/:id/assign", authenticate, requireAdmin, validate(playerAssignmentSchema), playerController.assignPlayerToTeam);
playerRouter.patch("/:id/unsold", authenticate, requireAdmin, playerController.markPlayerUnsold);
playerRouter.patch("/:id/deactivate", authenticate, requireAdmin, playerController.deactivatePlayer);
playerRouter.delete("/:id", authenticate, requireAdmin, playerController.deletePlayer);