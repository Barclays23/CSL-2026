import { Router } from "express";
import { authenticate } from "../../middlewares/authenticate.middleware.js";
import { requireAdmin } from "../../middlewares/authorizeAdmin.middleware.js";
import { validate } from "../../middlewares/validate.middleware.js";
import { settingsController } from "../../container/dependencies.js";
import { settingsUpdateSchema } from "./settings.dto.js";




export const settingsRouter = Router();




settingsRouter.get("/", settingsController.getTournamentSettings);
settingsRouter.patch(
  "/",
  authenticate,
  requireAdmin,
  validate(settingsUpdateSchema),
  settingsController.updateTournamentSettings,
);