import { UserModel } from "./user.model.js";
import type { UserRecord } from "./user.model.js";
import { CrudRepository } from "../../shared/utils/crud.repository.js";
export class UserRepository extends CrudRepository<UserRecord> {
  constructor(){super(UserModel);}
  async findByEmail(email:string){return UserModel.findOne({email}).select("+passwordHash").lean().exec();}
  async findByIdWithPassword(id:string){return UserModel.findById(id).select("+passwordHash").lean().exec();}
}
