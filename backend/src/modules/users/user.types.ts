import type { Types } from "mongoose";
export type UserStatus = "active" | "blocked";
export interface UserFields { name: string; email: string; passwordHash: string; role: "admin"; status: UserStatus; }
export interface UserEntity extends UserFields { _id: Types.ObjectId; }
export interface AdminUserDTO { _id: string; name: string; email: string; role: "admin"; status: UserStatus; }
export interface IUserRepository {
  findUserByEmail(email: string): Promise<UserEntity | null>;
  findUserById(userId: string): Promise<UserEntity | null>;
  createUser(data: UserFields): Promise<UserEntity>;
}
export interface IUserService { seedAdmin(): Promise<void>; }
