import { Router } from "express";
import { authenticate } from "../../middlewares/authenticate.middleware.js";
import { requireAdmin } from "../../middlewares/authorizeAdmin.middleware.js";
import { validate } from "../../middlewares/validate.middleware.js";
import { controllers } from "../../container/index.js";
import { settingsUpdateSchema } from "./settings.dto.js";
export const settingsRouter=Router();
settingsRouter.get("/",controllers.settings.get);
settingsRouter.patch("/",authenticate,requireAdmin,validate(settingsUpdateSchema),controllers.settings.update);
