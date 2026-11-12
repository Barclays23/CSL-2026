import type { Types } from "mongoose";
import { UserModel, type UserRecord } from "./user.model.js";
import type { IUserRepository, UserEntity, UserFields } from "./user.types.js";
export class UserRepository implements IUserRepository {
  async findUserByEmail(email: string): Promise<UserEntity | null> {
    return UserModel.findOne({ email }).select("+passwordHash").lean().exec() as Promise<UserEntity | null>;
  }
  async findUserById(userId: string): Promise<UserEntity | null> {
    return UserModel.findById(userId).select("+passwordHash").lean().exec() as Promise<UserEntity | null>;
  }
  async createUser(data: UserFields): Promise<UserEntity> {
    const user = await UserModel.create(data);
    return user.toObject() as UserEntity;
  }
}
