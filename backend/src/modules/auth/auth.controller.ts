import type { RequestHandler } from "express";
import { asyncHandler } from "../../shared/utils/asyncHandler.js";
import { sendSuccess } from "../../shared/responses/response.helper.js";
import { env } from "../../config/env.config.js";
import type { IAuthController, IAuthService } from "./auth.types.js";
import { loginSchema } from "./auth.dto.js";

export class AuthController implements IAuthController {
  constructor(private readonly authService: IAuthService) {}

  login: RequestHandler = asyncHandler(async (request, response) => {
    const credentials = loginSchema.parse(request.body);
    const session = await this.authService.login(credentials);

    response.cookie("csl_token", session.token, {
      httpOnly: true,
      secure: env.COOKIE_SECURE,
      sameSite: env.COOKIE_SAME_SITE,
      path: "/",
      maxAge: 24 * 60 * 60 * 1000,
    });

    sendSuccess(response, session.user, "Login successful");
  });

  logout: RequestHandler = (_request, response) => {
    response.clearCookie("csl_token", {
      httpOnly: true,
      secure: env.COOKIE_SECURE,
      sameSite: env.COOKIE_SAME_SITE,
      path: "/",
    });
    sendSuccess(response, null, "Logged out successfully");
  };

  getCurrentAdmin: RequestHandler = asyncHandler(async (request, response) => {
    const adminUser = await this.authService.getCurrentAdmin(request.user?.id ?? "");
    sendSuccess(response, adminUser, "Current administrator");
  });
}
