import type { Types } from "mongoose";
import type { AdminUserDTO } from "./user.dto.js";
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

export interface SafeUserEntity extends Omit<UserEntity, "passwordHash"> {}



export type AdminUserCreateDTO = Omit<AdminUserCreateInput, "password">;

export type { IUserRepository, IUserService } from "./user.interfaces.js";

export type { AdminUserDTO } from "./user.dto.js";
