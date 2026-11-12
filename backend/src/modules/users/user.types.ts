import type { Types } from "mongoose";
import type { AdminUserCreateInput } from "./user.dto.js";

export type UserStatus = "active" | "blocked";
export type UserRole = "admin";

export interface UserFields {
  name: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  status: UserStatus;
}

export interface UserEntity extends UserFields {
  _id: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export interface AdminUserDTO {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
}

export type AdminUserCreateDTO = AdminUserCreateInput;

export interface IUserRepository {
  findUserByEmail(email: string): Promise<UserEntity | null>;
  findUserById(userId: string): Promise<UserEntity | null>;
  createAdminUser(data: AdminUserCreateDTO & { passwordHash: string }): Promise<UserEntity>;
}

export interface IUserService {
  createInitialAdmin(): Promise<void>;
  getAdminUserById(userId: string): Promise<AdminUserDTO>;
}
