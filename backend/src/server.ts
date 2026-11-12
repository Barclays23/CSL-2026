import { env } from "./config/env.config.js";
import { connectDatabase, disconnectDatabase } from "./config/database.config.js";
import app from "./app.js";

async function startServer(): Promise<void> {
  await connectDatabase(env.MONGODB_URI);

  const server = app.listen(env.PORT, () => {
    console.log(`CSL API listening on http://localhost:${env.PORT}${env.API_PREFIX}`);
  });

  const shutdown = (signal: string) => {
    console.log(`${signal} received. Closing CSL API...`);
    server.close(async (error) => {
      if (error) {
        console.error("HTTP server shutdown failed:", error);
        process.exitCode = 1;
      }

      try {
        await disconnectDatabase();
      } catch (databaseError) {
        console.error("MongoDB shutdown failed:", databaseError);
        process.exitCode = 1;
      }
    });
  };

  process.once("SIGINT", () => shutdown("SIGINT"));
  process.once("SIGTERM", () => shutdown("SIGTERM"));
}

startServer().catch((error: unknown) => {
  console.error("Unable to start CSL API:", error);
  process.exitCode = 1;
});
