import { appConfig } from "./config/env.config.js";
import { connectDatabase, disconnectDatabase } from "./config/database.config.js";
import { settingsService } from "./container/dependencies.js";
import app from "./app.js";




async function startServer(): Promise<void> {
  await connectDatabase(appConfig.MONGODB_URI);
  await settingsService.initializeTournamentSettings();

  const server = app.listen(appConfig.PORT, () => {
    console.log(`CSL API running at http://localhost:${appConfig.PORT}${appConfig.API_PREFIX}`);
  });

  const shutdown = (signal: string): void => {
    console.log(`${signal} received; shutting down`);
    server.close(async (error) => {
      if (error) {
        console.error("HTTP shutdown error", error);
        process.exitCode = 1;
      }
      try {
        await disconnectDatabase();
      } catch (databaseError: unknown) {
        console.error("MongoDB shutdown error", databaseError);
        process.exitCode = 1;
      }
    });
  };

  process.once("SIGINT", () => shutdown("SIGINT"));
  process.once("SIGTERM", () => shutdown("SIGTERM"));
}

startServer().catch((error: unknown) => {
  console.error("Unable to start CSL backend", error);
  process.exitCode = 1;
});
