import { Router } from "express";
import { authenticate } from "../../middlewares/authenticate.middleware.js";
import { requireAdmin } from "../../middlewares/authorizeAdmin.middleware.js";
import { validate } from "../../middlewares/validate.middleware.js";
import { controllers } from "../../container/index.js";
import { goalSchema, matchCreateSchema, matchQuerySchema, matchUpdateSchema } from "./match.dto.js";

export const matchRouter = Router();

matchRouter.get("/", validate(matchQuerySchema, "query"), controllers.matches.getMatches);
matchRouter.get("/:id", controllers.matches.getMatchById);
matchRouter.post("/", authenticate, requireAdmin, validate(matchCreateSchema), controllers.matches.createMatch);
matchRouter.patch("/:id", authenticate, requireAdmin, validate(matchUpdateSchema), controllers.matches.updateMatch);
matchRouter.delete("/:id", authenticate, requireAdmin, controllers.matches.deleteMatch);
matchRouter.post("/:id/goals", authenticate, requireAdmin, validate(goalSchema), controllers.matches.addGoalToMatch);
matchRouter.patch("/:id/goals/:goalId", authenticate, requireAdmin, validate(goalSchema), controllers.matches.updateMatchGoal);
matchRouter.delete("/:id/goals/:goalId", authenticate, requireAdmin, controllers.matches.deleteMatchGoal);
