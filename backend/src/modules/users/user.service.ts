import bcrypt from "bcryptjs";
import { appConfig } from "../../config/env.config.js";
import { AppError } from "../../shared/errors/appError.js";
import type { IUserRepository, IUserService } from "./user.interfaces.js";
import type { AdminUserDTO } from "./user.types.js";




export class UserService implements IUserService {
  constructor(private readonly _userRepository: IUserRepository) {}

  async createInitialAdmin(): Promise<void> {
    if (!appConfig.ADMIN_EMAIL || !appConfig.ADMIN_PASSWORD) {
      console.warn("ADMIN_EMAIL/ADMIN_PASSWORD not set; skipping admin seed");
      return;
    }

    const normalizedEmail = appConfig.ADMIN_EMAIL.trim().toLowerCase();
    const normalizedMobile = appConfig.ADMIN_MOBILE.trim();
    const normalizedUsername = appConfig.ADMIN_USERNAME?.trim().toLowerCase() || undefined;

    const existingByEmail = await this._userRepository.findUserByEmail(normalizedEmail);
    if (existingByEmail) {
      console.log("Admin already exists; seed skipped");
      return;
    }

    if (normalizedUsername) {
      const existingByUsername = await this._userRepository.findUserByUsername(normalizedUsername);
      if (existingByUsername) {
        throw new AppError(
          `Seed aborted: username "${normalizedUsername}" is already taken`,
          409,
          "USERNAME_CONFLICT"
        );
      }
    }

    if (normalizedMobile) {
      const existingByMobile = await this._userRepository.findUserByMobile(normalizedMobile);
      if (existingByMobile) {
        throw new AppError(
          `Seed aborted: mobile "${normalizedMobile}" is already registered`,
          409,
          "MOBILE_CONFLICT"
        );
      }
    }

    const passwordHash = await bcrypt.hash(appConfig.ADMIN_PASSWORD, 12);

    await this._userRepository.createAdminUser({
      name: appConfig.ADMIN_NAME.trim(),
      email: normalizedEmail,
      mobile: normalizedMobile,
      ...(normalizedUsername ? { username: normalizedUsername } : {}),
      passwordHash,
    });

    console.log("Administrator account created");
  }

  async getAdminUserById(userId: string): Promise<AdminUserDTO> {
    if (!userId?.trim()) {
      throw new AppError("Administrator ID is required", 400, "VALIDATION_ERROR");
    }

    const user = await this._userRepository.findUserById(userId);

    if (!user) {
      throw new AppError("Administrator not found", 404, "ADMIN_NOT_FOUND");
    }

    if (user.status !== "active") {
      throw new AppError("Administrator account is blocked", 403, "ACCOUNT_INACTIVE");
    }

    return {
      _id: String(user._id),
      name: user.name,
      email: user.email,
      mobile: user.mobile,
      ...(user.username ? { username: user.username } : {}),
      role: user.role,
      status: user.status,
    };
  }
}