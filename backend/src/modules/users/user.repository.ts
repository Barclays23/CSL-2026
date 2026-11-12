import { UserModel } from "./user.model.js";
import { CrudRepository } from "../../shared/utils/crud.repository.js";
export class UserRepository extends CrudRepository {
  constructor(){super(UserModel);}
  async findByEmail(email:string){return this.native.findOne({email}).select("+passwordHash").lean().exec();}
  async findByIdWithPassword(id:string){return this.native.findById(id).select("+passwordHash").lean().exec();}
}
