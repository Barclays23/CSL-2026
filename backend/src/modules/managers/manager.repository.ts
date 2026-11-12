import { ManagerModel } from "./manager.model.js";
import type { ManagerRecord } from "./manager.model.js";
import { CrudRepository } from "../../shared/utils/crud.repository.js";
export class ManagerRepository extends CrudRepository<ManagerRecord> {
  constructor(){super(ManagerModel);}
  async listPopulated(filter:Record<string,unknown>,page:number,limit:number){
    const [items,total]=await Promise.all([
      ManagerModel.find(filter as never).sort({name:1}).skip((page-1)*limit).limit(limit).populate({path:"teamRef",select:"name shortName logo groupName"}).lean().exec(),
      ManagerModel.countDocuments(filter as never).exec()
    ]);
    return {items,total};
  }
  async findPopulated(id:string){return ManagerModel.findById(id).populate({path:"teamRef",select:"name shortName logo groupName"}).lean().exec();}
}
