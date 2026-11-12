import bcrypt from "bcryptjs";
import { appConfig } from "../../config/env.config.js";
import { AppError } from "../../shared/errors/appError.js";
import type { AdminUserDTO, IUserRepository, IUserService } from "./user.types.js";




export class UserService implements IUserService {
  constructor(
    private readonly _userRepository: IUserRepository
  ) {}

  async createInitialAdmin(): Promise<void> {
    if (!appConfig.ADMIN_EMAIL || !appConfig.ADMIN_PASSWORD) {
      console.warn("ADMIN_EMAIL/ADMIN_PASSWORD not set; skipping admin seed");
      return;
    }

    const normalizedEmail = appConfig.ADMIN_EMAIL.trim().toLowerCase();
    const existingAdmin = await this._userRepository.findUserByEmail(normalizedEmail);
    if (existingAdmin) {
      console.log("Admin already exists; seed skipped");
      return;
    }

    const passwordHash = await bcrypt.hash(appConfig.ADMIN_PASSWORD, 12);
    await this._userRepository.createAdminUser({
      name: appConfig.ADMIN_NAME,
      email: normalizedEmail,
      passwordHash,
    });
    console.log("Administrator account created");
  }

  async getAdminUserById(userId: string): Promise<AdminUserDTO> {
    const user = await this._userRepository.findUserById(userId);
    if (!user || user.status !== "active") {
      throw new AppError("Administrator not found", 404, "ADMIN_NOT_FOUND");
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
