import { AppError } from "../../shared/errors/appError.js";
import { SponsorRepository } from "./sponsor.repository.js";
export class SponsorService {
  constructor(private readonly _sponsorRepo:SponsorRepository){}
  async list(query:Record<string,unknown>,admin:boolean){
    const f:Record<string,unknown>={};if(admin&&query.status)f.status=query.status;else if(!admin)f.status="active";if(query.search)f.name={$regex:String(query.search),$options:"i"};
    const r=await this._sponsorRepo.listSponsors(f,Number(query.page||1),Number(query.limit||50),admin);
    return {items:r.items.map(s=>this.map(s as unknown as Record<string,unknown>,admin)),total:r.total,page:Number(query.page||1),limit:Number(query.limit||50)};
  }
  map(s:Record<string,unknown>,admin:boolean){const {_id,name,logo,tier,website,status,contactPerson,contactMobile,notes}=s;return admin?{_id:String(_id),name,logo,tier,website,status,contactPerson:contactPerson??null,contactMobile:contactMobile??null,notes:notes??null}:{_id:String(_id),name,logo,tier,website,status};}
  async get(id:string,admin:boolean){const s=await this._sponsorRepo.findSponsor(id,admin) as unknown as Record<string,unknown>|null;if(!s||(!admin&&s.status!=="active"))throw new AppError("Sponsor not found",404,"NOT_FOUND");return this.map(s,admin);}
  async save(data:Record<string,unknown>,id?:string){
    const v=id?await this._sponsorRepo.updateSponsor(id,data,true):await this._sponsorRepo.create(data);
    if(!v)throw new AppError("Sponsor not found",404,"NOT_FOUND");
    return this.map(v as unknown as Record<string,unknown>,true);
  }
  async remove(id:string){const r=await this._sponsorRepo.remove(id);if(!r)throw new AppError("Sponsor not found",404,"NOT_FOUND");return null;}
}
