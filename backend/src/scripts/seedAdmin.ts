import { connectDatabase,disconnectDatabase } from "../config/database.config.js";
import { env } from "../config/env.config.js";
import { UserService } from "../modules/users/user.service.js";
import { UserRepository } from "../modules/users/user.repository.js";
async function main(){
  await connectDatabase(env.MONGODB_URI);
  try { await new UserService(new UserRepository()).seedAdmin(); }
  finally { await disconnectDatabase(); }
}
main().catch(error=>{console.error("Admin seed failed",error);process.exitCode=1;});
