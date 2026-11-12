import { Router } from "express";
import { validate } from "../../middlewares/validate.middleware.js";
import { authenticate } from "../../middlewares/authenticate.middleware.js";
import { loginLimiter } from "../../middlewares/rateLimit.middleware.js";
import { authController } from "../../container/dependencies.js";
import { loginSchema } from "./auth.schema.js";



export const authRouter = Router();



authRouter.post("/login", loginLimiter, validate(loginSchema), authController.login);
authRouter.post("/logout", authController.logout);
authRouter.get("/me", authenticate, authController.getCurrentAdmin);
