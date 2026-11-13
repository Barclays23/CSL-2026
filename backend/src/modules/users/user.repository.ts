import { UserModel } from "./user.model.js";
import type {
  AdminUserCreateDTO,
  IUserRepository,
  SafeUserEntity,
  UserEntity,
} from "./user.types.js";




export class UserRepository implements IUserRepository {
  async findUserByEmail(email: string): Promise<UserEntity | null> {
    return UserModel.findOne({ email }).select("+passwordHash").lean<UserEntity>().exec();
  }

  async findUserById(userId: string): Promise<SafeUserEntity | null> {
    return UserModel.findById(userId)
      .select("name email username mobile role status createdAt updatedAt")
      .lean<SafeUserEntity>()
      .exec();
  }

  async findUserByMobile(mobile: string): Promise<UserEntity | null> {
    return UserModel.findOne({ mobile }).select("+passwordHash").lean<UserEntity>().exec();
  }

  async findUserByUsername(username: string): Promise<UserEntity | null> {
    return UserModel.findOne({ username }).select("+passwordHash").lean<UserEntity>().exec();
  }

  async createAdminUser(data: AdminUserCreateDTO & { passwordHash: string }): Promise<SafeUserEntity> {
    const createdUser = await UserModel.create({
      name: data.name,
      email: data.email,
      mobile: data.mobile,
      ...(data.username ? { username: data.username } : {}),
      passwordHash: data.passwordHash,
      role: "admin",
      status: "active",
    });

    const savedUser = await this.findUserById(String(createdUser._id));
    if (!savedUser) throw new Error("Created administrator could not be retrieved");

    return savedUser;
  }

}
