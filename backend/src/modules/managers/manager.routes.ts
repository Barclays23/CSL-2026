import { Router } from "express";
import { authenticate } from "../../middlewares/authenticate.middleware.js";
import { optionalAuthenticate } from "../../middlewares/optionalAuthenticate.middleware.js";
import { requireAdmin } from "../../middlewares/authorizeAdmin.middleware.js";
import { validate } from "../../middlewares/validate.middleware.js";
import { controllers } from "../../container/index.js";
import { managerCreateSchema, managerQuerySchema, managerUpdateSchema } from "./manager.dto.js";

export const managerRouter = Router();

managerRouter.get("/", optionalAuthenticate, validate(managerQuerySchema, "query"), controllers.managers.getManagers);
managerRouter.get("/:id", optionalAuthenticate, controllers.managers.getManagerById);
managerRouter.post("/", authenticate, requireAdmin, validate(managerCreateSchema), controllers.managers.createManager);
managerRouter.patch("/:id", authenticate, requireAdmin, validate(managerUpdateSchema), controllers.managers.updateManager);
managerRouter.delete("/:id", authenticate, requireAdmin, controllers.managers.deleteManager);
