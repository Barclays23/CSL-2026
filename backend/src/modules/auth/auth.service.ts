import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { env } from "../../config/env.config.js";
import { AppError } from "../../shared/errors/appError.js";
import type { AdminUserDTO, IUserRepository } from "../users/user.types.js";
import type { AuthSessionDTO, IAuthService, LoginCredentials } from "./auth.types.js";

export class AuthService implements IAuthService {
  constructor(private readonly userRepository: IUserRepository) {}

  async login(credentials: LoginCredentials): Promise<AuthSessionDTO> {
    const user = await this.userRepository.findUserByEmail(credentials.email);

    if (!user || user.status !== "active") {
      throw new AppError("Invalid email or password", 401, "INVALID_CREDENTIALS");
    }

    const passwordMatches = await bcrypt.compare(credentials.password, user.passwordHash);
    if (!passwordMatches) {
      throw new AppError("Invalid email or password", 401, "INVALID_CREDENTIALS");
    }

    const token = jwt.sign(
      { role: user.role, email: user.email },
      env.JWT_SECRET,
      {
        subject: String(user._id),
        expiresIn: env.JWT_EXPIRES_IN,
      },
    );

    const adminUser: AdminUserDTO = {
      _id: String(user._id),
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
    };

    return { token, user: adminUser };
  }

  async getCurrentAdmin(userId: string): Promise<AdminUserDTO> {
    const user = await this.userRepository.findUserById(userId);
    if (!user || user.status !== "active" || user.role !== "admin") {
      throw new AppError("Administrator not found", 401, "UNAUTHENTICATED");
    }

    return {
      _id: String(user._id),
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
    };
  }
}
