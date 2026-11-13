import type { UserEntity, SafeUserEntity, AdminUserDTO, AdminUserCreateDTO } from "./user.types.js";
import type { Types } from "mongoose";
import type { AdminUserCreateInput } from "./user.dto.js";



export interface IUserRepository {
  findUserByEmail(email: string): Promise<UserEntity | null>;
  findUserByMobile(mobile: string): Promise<UserEntity | null>;
  findUserByUsername(username: string): Promise<UserEntity | null>
  findUserById(userId: string): Promise<SafeUserEntity | null>;
  createAdminUser(data: AdminUserCreateDTO): Promise<SafeUserEntity>;
}


export interface IUserService {
  createInitialAdmin(): Promise<void>;
  getAdminUserById(userId: string): Promise<AdminUserDTO>;
}
