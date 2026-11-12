import type { AdminUserDTO } from "../users/user.types.js";
import type { LoginInput } from "./auth.dto.js";

export interface LoginCredentials extends LoginInput {}

export interface JwtAdminPayload {
  sub: string;
  email: string;
  role: "admin";
  iat?: number;
  exp?: number;
}

export interface AuthSessionDTO {
  token: string;
  user: AdminUserDTO;
}

export interface IAuthService {
  login(credentials: LoginCredentials): Promise<AuthSessionDTO>;
  getCurrentAdmin(userId: string): Promise<AdminUserDTO>;
}

export interface IAuthController {
  login: import("express").RequestHandler;
  logout: import("express").RequestHandler;
  getCurrentAdmin: import("express").RequestHandler;
}
