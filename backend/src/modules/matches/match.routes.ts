import { Router } from "express";
import { authenticate } from "../../middlewares/authenticate.middleware.js";
import { requireAdmin } from "../../middlewares/authorizeAdmin.middleware.js";
import { validate } from "../../middlewares/validate.middleware.js";
import { matchController } from "../../container/dependencies.js";
import { goalSchema, matchCreateSchema, matchQuerySchema, matchUpdateSchema } from "./match.schema.js";




export const matchRouter = Router();




matchRouter.get("/", validate(matchQuerySchema, "query"), matchController.getMatches);
matchRouter.get("/:id", matchController.getMatchById);
matchRouter.post("/", authenticate, requireAdmin, validate(matchCreateSchema), matchController.createMatch);
matchRouter.patch("/:id", authenticate, requireAdmin, validate(matchUpdateSchema), matchController.updateMatch);
matchRouter.delete("/:id", authenticate, requireAdmin, matchController.deleteMatch);
matchRouter.post("/:id/goals", authenticate, requireAdmin, validate(goalSchema), matchController.addGoalToMatch);
matchRouter.patch("/:id/goals/:goalId", authenticate, requireAdmin, validate(goalSchema), matchController.updateMatchGoal);
matchRouter.delete("/:id/goals/:goalId", authenticate, requireAdmin, matchController.deleteMatchGoal);