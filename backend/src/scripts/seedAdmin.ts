import { connectDatabase, disconnectDatabase } from "../config/database.config.js";
import { env } from "../config/env.config.js";
import { UserRepository } from "../modules/users/user.repository.js";
import { UserService } from "../modules/users/user.service.js";

async function seedInitialAdmin(): Promise<void> {
  await connectDatabase(env.MONGODB_URI);
  try {
    const userRepository = new UserRepository();
    const userService = new UserService(userRepository);
    await userService.createInitialAdmin();
  } finally {
    await disconnectDatabase();
  }
}

seedInitialAdmin().catch((error: unknown) => {
  console.error("Admin seed failed", error);
  process.exitCode = 1;
});
