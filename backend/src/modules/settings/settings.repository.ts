import { SettingsModel } from "./settings.model.js";
import type { SettingsRecord } from "./settings.model.js";
import { CrudRepository } from "../../shared/utils/crud.repository.js";
export class SettingsRepository extends CrudRepository<SettingsRecord> {
  constructor(){super(SettingsModel);}
  async getSingleton(){return this.native.findOne({singletonKey:"CSL_CURRENT"}).lean().exec();}
  async initialize(){return this.native.findOneAndUpdate({singletonKey:"CSL_CURRENT"},{$setOnInsert:{singletonKey:"CSL_CURRENT"}},{upsert:true,new:true,setDefaultsOnInsert:true}).lean().exec();}
  async updateSingleton(data:Record<string,unknown>){return this.native.findOneAndUpdate({singletonKey:"CSL_CURRENT"},{$set:data},{new:true,runValidators:true}).lean().exec();}
}
