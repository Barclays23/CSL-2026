import bcrypt from "bcryptjs";
import { env } from "../../config/env.config.js";
import { UserRepository } from "./user.repository.js";
export class UserService {
  constructor(private readonly users:UserRepository){}
  async seedAdmin(){
    if(!env.ADMIN_EMAIL || !env.ADMIN_PASSWORD) { console.warn("ADMIN_EMAIL/ADMIN_PASSWORD not set; skipping admin seed"); return; }
    const existing=await this.users.findByEmail(env.ADMIN_EMAIL.toLowerCase());
    if(existing){console.log("Admin already exists; seed skipped");return;}
    const passwordHash=await bcrypt.hash(env.ADMIN_PASSWORD,12);
    await this.users.create({name:env.ADMIN_NAME,email:env.ADMIN_EMAIL.toLowerCase(),passwordHash,role:"admin",status:"active"});
    console.log("Administrator account created");
  }
}
