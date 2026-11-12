import type { UserStatus } from "../users/user.types.js";
export interface LoginCredentials { email: string; password: string; }
export interface JwtAdminPayload { sub: string; email: string; role: "admin"; }
export interface AuthenticatedAdminDTO { _id: string; name: string; email: string; role: "admin"; status: UserStatus; }
export interface LoginResponseDTO { token: string; user: AuthenticatedAdminDTO; }
export interface IAuthService {
  login(credentials: LoginCredentials): Promise<LoginResponseDTO>;
  getCurrentAdmin(adminId: string): Promise<AuthenticatedAdminDTO>;
}
