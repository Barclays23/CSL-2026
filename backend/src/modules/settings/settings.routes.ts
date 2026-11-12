import { Router } from "express";
import { authenticate } from "../../middlewares/authenticate.middleware.js";
import { requireAdmin } from "../../middlewares/authorizeAdmin.middleware.js";
import { controllers } from "../../container/index.js";
export const settingsRouter = Router();
settingsRouter.get("/", controllers.settings.getSettings);
settingsRouter.patch("/", authenticate, requireAdmin, controllers.settings.updateSettings);
