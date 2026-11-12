import { Router } from "express";
import { authenticate } from "../../middlewares/authenticate.middleware.js";
import { optionalAuthenticate } from "../../middlewares/optionalAuthenticate.middleware.js";
import { requireAdmin } from "../../middlewares/authorizeAdmin.middleware.js";
import { validate } from "../../middlewares/validate.middleware.js";
import { teamController } from "../../container/dependencies.js";
import { teamCreateSchema, teamQuerySchema, teamUpdateSchema } from "./team.schema.js";




export const teamRouter = Router();




teamRouter.get("/auction-summary", optionalAuthenticate, teamController.getTeamAuctionSummary);
teamRouter.get("/:id/statistics", teamController.getTeamStatistics);
teamRouter.get("/", optionalAuthenticate, validate(teamQuerySchema, "query"), teamController.getTeams);
teamRouter.get("/:id", optionalAuthenticate, teamController.getTeamById);
teamRouter.post("/", authenticate, requireAdmin, validate(teamCreateSchema), teamController.createTeam);
teamRouter.patch("/:id", authenticate, requireAdmin, validate(teamUpdateSchema), teamController.updateTeam);
teamRouter.delete("/:id", authenticate, requireAdmin, teamController.deleteTeam);
