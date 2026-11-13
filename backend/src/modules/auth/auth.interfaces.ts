import type { LoginCredentials, AuthSessionDTO } from "./auth.types.js";
import type { AdminUserDTO } from "../users/user.types.js";
import type { LoginInput } from "./auth.dto.js";
import { ControllerMethod } from "../../shared/types/common.types.js";



export interface IAuthService {
  login(credentials: LoginCredentials): Promise<AuthSessionDTO>;
  getCurrentAdmin(userId: string): Promise<AdminUserDTO>;
}


export interface IAuthController {
  login: ControllerMethod;
  logout: ControllerMethod;
  getCurrentAdmin: ControllerMethod;
}
