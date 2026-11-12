import { Router } from "express";
import { authenticate } from "../../middlewares/authenticate.middleware.js";
import { optionalAuthenticate } from "../../middlewares/optionalAuthenticate.middleware.js";
import { requireAdmin } from "../../middlewares/authorizeAdmin.middleware.js";
import { validate } from "../../middlewares/validate.middleware.js";
import { managerController } from "../../container/dependencies.js";
import { managerCreateSchema, managerQuerySchema, managerUpdateSchema } from "./manager.dto.js";


export const managerRouter = Router();



managerRouter.get("/", optionalAuthenticate, validate(managerQuerySchema, "query"), managerController.getManagers);
managerRouter.get("/:id", optionalAuthenticate, managerController.getManagerById);
managerRouter.post("/", authenticate, requireAdmin, validate(managerCreateSchema), managerController.createManager);
managerRouter.patch("/:id", authenticate, requireAdmin, validate(managerUpdateSchema), managerController.updateManager);
managerRouter.delete("/:id", authenticate, requireAdmin, managerController.deleteManager);