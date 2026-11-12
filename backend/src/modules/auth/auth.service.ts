import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { env } from "../../config/env.config.js";
import { AppError } from "../../shared/errors/appError.js";
import { UserRepository } from "../users/user.repository.js";
import type { LoginCredentials, LoginResponseDTO, AuthenticatedAdminDTO, IAuthService } from "./auth.types.js";
export class AuthService implements IAuthService {
  constructor(private readonly userRepository: UserRepository) {}
  async login(credentials: LoginCredentials): Promise<LoginResponseDTO> {
    const user = await this.userRepository.findUserByEmail(credentials.email.trim().toLowerCase());
    if (!user || user.status !== "active" || !(await bcrypt.compare(credentials.password, user.passwordHash))) throw new AppError("Invalid email or password", 401, "INVALID_CREDENTIALS");
    const token = jwt.sign({ role: "admin", email: user.email }, env.JWT_SECRET, { subject: String(user._id), expiresIn: env.JWT_EXPIRES_IN as jwt.SignOptions["expiresIn"] });
    return { token, user: this.mapAdminUser(user) };
  }
  async getCurrentAdmin(adminId: string): Promise<AuthenticatedAdminDTO> {
    const user = await this.userRepository.findUserById(adminId);
    if (!user || user.status !== "active") throw new AppError("Administrator not found", 401, "UNAUTHENTICATED");
    return this.mapAdminUser(user);
  }
  private mapAdminUser(user: import("../users/user.types.js").UserEntity): AuthenticatedAdminDTO {
    return { _id: String(user._id), name: user.name, email: user.email, role: user.role, status: user.status };
  }
}
