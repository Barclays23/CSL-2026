import { AppError } from "../../shared/errors/appError.js";
import { normalizeEmail,normalizeMobile } from "../../shared/utils/normalizeInput.js";
import { ManagerRepository } from "./manager.repository.js";
import { TeamRepository } from "../teams/team.repository.js";
type Row=Record<string,unknown>;
const brief=(v:unknown):Row|null=>v&&typeof v==="object"&&"_id" in v?({_id:String((v as Row)._id),name:(v as Row).name,shortName:(v as Row).shortName??null,logo:(v as Row).logo??null,groupName:(v as Row).groupName??null}):null;
export class ManagerService {
  constructor(private readonly _managerRepository:ManagerRepository,private readonly _teamRepository:TeamRepository){}
  async list(query:Row,admin:boolean){
    const f:Row={};if(query.search)f.name={$regex:String(query.search),$options:"i"};if(admin&&query.status)f.status=query.status;else if(!admin)f.status="active";if(query.teamRef)f.teamRef=query.teamRef;
    const r=await this._managerRepository.listPopulated(f,Number(query.page||1),Number(query.limit||20));
    return {items:(r.items as unknown as Row[]).map(m=>this.map(m,admin)),total:r.total,page:Number(query.page||1),limit:Number(query.limit||20)};
  }
  async get(id:string,admin:boolean){const m=await this._managerRepository.findPopulated(id) as unknown as Row|null;if(!m||(!admin&&m.status!=="active"))throw new AppError("Manager not found",404,"NOT_FOUND");return this.map(m,admin);}
  map(m:Row,admin:boolean){const {_id,name,teamRef,role,profilePic,status,mobile,email,dateOfBirth}=m;const team=brief(teamRef);return admin?{_id:String(_id),name,teamRef:team?team._id:teamRef?String(teamRef):null,team,role,profilePic,status,mobile,email:email??null,dateOfBirth:dateOfBirth??null}:{_id:String(_id),name,teamRef:team?team._id:teamRef?String(teamRef):null,team,role,profilePic,status};}
  async save(data:Row,id?:string){
    if(data.teamRef){const team=await this._teamRepository.findById(String(data.teamRef));if(!team||team.status!=="active")throw new AppError("Select an active team",422,"INVALID_TEAM");}
    if(data.mobile)data.mobile=normalizeMobile(String(data.mobile));if("email"in data)data.email=normalizeEmail(data.email as string|null|undefined);
    if(data.mobile){const existing=await this._managerRepository.findOne({mobile:data.mobile,...(id?{_id:{$ne:id}}:{})});if(existing)throw new AppError("Mobile already exists",409,"DUPLICATE_MOBILE",{mobile:"Mobile already exists"});}
    if(data.email){const e=await this._managerRepository.findOne({email:data.email,...(id?{_id:{$ne:id}}:{})});if(e)throw new AppError("Email already exists",409,"DUPLICATE_EMAIL",{email:"Email already exists"});}
    const v=id?await this._managerRepository.update(id,data):await this._managerRepository.create(data);if(!v)throw new AppError("Manager not found",404,"NOT_FOUND");return this.map(v,true);
  }
  async remove(id:string){const r=await this._managerRepository.remove(id);if(!r)throw new AppError("Manager not found",404,"NOT_FOUND");return null;}
}
