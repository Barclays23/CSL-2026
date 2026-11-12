import { Router } from "express";
import { authenticate } from "../../middlewares/authenticate.middleware.js";
import { optionalAuthenticate } from "../../middlewares/optionalAuthenticate.middleware.js";
import { requireAdmin } from "../../middlewares/authorizeAdmin.middleware.js";
import { validate } from "../../middlewares/validate.middleware.js";
import { controllers } from "../../container/index.js";
import { teamCreateSchema, teamQuerySchema, teamUpdateSchema } from "./team.dto.js";

export const teamRouter = Router();

teamRouter.get("/auction-summary", optionalAuthenticate, controllers.teams.getTeamAuctionSummary);
teamRouter.get("/:id/statistics", controllers.teams.getTeamStatistics);
teamRouter.get("/", optionalAuthenticate, validate(teamQuerySchema, "query"), controllers.teams.getTeams);
teamRouter.get("/:id", optionalAuthenticate, controllers.teams.getTeamById);
teamRouter.post("/", authenticate, requireAdmin, validate(teamCreateSchema), controllers.teams.createTeam);
teamRouter.patch("/:id", authenticate, requireAdmin, validate(teamUpdateSchema), controllers.teams.updateTeam);
teamRouter.delete("/:id", authenticate, requireAdmin, controllers.teams.deleteTeam);
