import bcrypt from "bcryptjs";
import { env } from "../../config/env.config.js";
import { UserRepository } from "./user.repository.js";
import type { IUserService } from "./user.types.js";
export class UserService implements IUserService {
  constructor(private readonly userRepository: UserRepository) {}
  async seedAdmin(): Promise<void> {
    if (!env.ADMIN_EMAIL || !env.ADMIN_PASSWORD) { console.warn("ADMIN_EMAIL/ADMIN_PASSWORD not set; skipping admin seed"); return; }
    const email = env.ADMIN_EMAIL.trim().toLowerCase();
    if (await this.userRepository.findUserByEmail(email)) { console.log("Admin already exists; seed skipped"); return; }
    const passwordHash = await bcrypt.hash(env.ADMIN_PASSWORD, 12);
    await this.userRepository.createUser({ name: env.ADMIN_NAME, email, passwordHash, role: "admin", status: "active" });
    console.log("Administrator account created");
  }
}
