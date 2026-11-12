import { Router } from "express";
import { validate } from "../../middlewares/validate.middleware.js";
import { authenticate } from "../../middlewares/authenticate.middleware.js";
import { loginLimiter } from "../../middlewares/rateLimit.middleware.js";
import { controllers } from "../../container/index.js";
import { loginSchema } from "./auth.dto.js";

export const authRouter = Router();

authRouter.post("/login", loginLimiter, validate(loginSchema), controllers.auth.login);
authRouter.post("/logout", controllers.auth.logout);
authRouter.get("/me", authenticate, controllers.auth.getCurrentAdmin);
