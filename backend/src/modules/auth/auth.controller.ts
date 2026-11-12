import type { Request, Response, NextFunction } from "express";
import { ApiResponse } from "../../utils/apiResponse.utils.js";
import { HTTP_STATUS } from "../../shared/constants/http-status.constants.js";
import { AUTH_MESSAGES } from "../../shared/constants/messages.constants.js";
import { AUTH_COOKIE_NAME } from "../../shared/constants/app.constants.js";
import { env } from "../../config/env.config.js";
import type { IAuthController, IAuthService, AuthSessionDTO } from "./auth.types.js";
import type { AdminUserDTO } from "../users/user.types.js";
import { loginSchema, type LoginInput } from "./auth.dto.js";

export class AuthController implements IAuthController {
  constructor(private readonly _authService: IAuthService) {
    this.login = this.login.bind(this);
    this.logout = this.logout.bind(this);
    this.getCurrentAdmin = this.getCurrentAdmin.bind(this);
  }

  async login(request: Request, response: Response, next: NextFunction): Promise<void> {
    try {
      const credentials: LoginInput = loginSchema.parse(request.body);
      const session: AuthSessionDTO = await this._authService.login(credentials);
      response.cookie(AUTH_COOKIE_NAME, session.token, {
        httpOnly: true,
        secure: env.COOKIE_SECURE,
        sameSite: env.COOKIE_SAME_SITE,
        path: "/",
        maxAge: 24 * 60 * 60 * 1000,
      });
      response.status(HTTP_STATUS.OK).json(ApiResponse.success<AdminUserDTO>(AUTH_MESSAGES.LOGIN_SUCCESS, session.user));
    } catch (error: unknown) { next(error); }
  }

  async logout(_request: Request, response: Response, next: NextFunction): Promise<void> {
    try {
      response.clearCookie(AUTH_COOKIE_NAME, {
        httpOnly: true,
        secure: env.COOKIE_SECURE,
        sameSite: env.COOKIE_SAME_SITE,
        path: "/",
      });
      response.status(HTTP_STATUS.OK).json(ApiResponse.success<null>(AUTH_MESSAGES.LOGOUT_SUCCESS, null));
    } catch (error: unknown) { next(error); }
  }

  async getCurrentAdmin(request: Request, response: Response, next: NextFunction): Promise<void> {
    try {
      const userId: string = request.user?.id ?? "";
      const adminUser: AdminUserDTO = await this._authService.getCurrentAdmin(userId);
      response.status(HTTP_STATUS.OK).json(ApiResponse.success<AdminUserDTO>(AUTH_MESSAGES.CURRENT_ADMIN_FETCHED, adminUser));
    } catch (error: unknown) { next(error); }
  }
}
