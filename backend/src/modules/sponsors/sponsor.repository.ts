import { SponsorModel } from "./sponsor.model.js";
import { CrudRepository } from "../../shared/utils/crud.repository.js";
export class SponsorRepository extends CrudRepository {
  constructor(){super(SponsorModel);}
  async listSponsors(filter:Record<string,unknown>,page:number,limit:number,admin:boolean){
    let q=SponsorModel.find(filter as never).sort({name:1}).skip((page-1)*limit).limit(limit);
    if(admin)q=q.select("+contactPerson +contactMobile +notes");
    const [items,total]=await Promise.all([q.lean().exec(),SponsorModel.countDocuments(filter as never).exec()]);
    return {items,total};
  }
  async findSponsor(id:string,admin:boolean){
    let q=SponsorModel.findById(id);if(admin)q=q.select("+contactPerson +contactMobile +notes");
    return q.lean().exec();
  }
  async updateSponsor(id:string,data:Record<string,unknown>,admin:boolean){
    let q=SponsorModel.findByIdAndUpdate(id,{$set:data},{new:true,runValidators:true});
    if(admin)q=q.select("+contactPerson +contactMobile +notes");
    return q.lean().exec();
  }
}
