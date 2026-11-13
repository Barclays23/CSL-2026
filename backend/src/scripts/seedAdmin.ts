import { connectDatabase, disconnectDatabase } from "../config/database.config.js";
import { appConfig } from "../config/env.config.js";
import { userService } from "../container/dependencies.js";




async function seedInitialAdmin(): Promise<void> {
  await connectDatabase(appConfig.MONGODB_URI);

  try {
    await userService.createInitialAdmin();

  } finally {
    await disconnectDatabase();
  }
}

seedInitialAdmin().catch((error: unknown) => {
  console.error("Admin seed failed", error);
  process.exitCode = 1;
});
