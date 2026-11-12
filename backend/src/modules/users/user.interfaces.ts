import type { Types } from "mongoose";
import type { AdminUserCreateInput } from "./user.dto.js";

export interface IUserRepository {
  findUserByEmail(email: string): Promise<UserEntity | null>;
  findUserById(userId: string): Promise<SafeUserEntity | null>;
  createAdminUser(data: AdminUserCreateDTO & { passwordHash: string }): Promise<SafeUserEntity>;
}
export interface IUserService {
  createInitialAdmin(): Promise<void>;
  getAdminUserById(userId: string): Promise<AdminUserDTO>;
}
