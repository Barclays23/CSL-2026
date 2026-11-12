import { Router } from "express";
import { authenticate } from "../../middlewares/authenticate.middleware.js";
import { controllers } from "../../container/index.js";
export const authRouter = Router();
authRouter.post("/login", controllers.auth.login);
authRouter.post("/logout", controllers.auth.logout);
authRouter.get("/me", authenticate, controllers.auth.getCurrentAdmin);
