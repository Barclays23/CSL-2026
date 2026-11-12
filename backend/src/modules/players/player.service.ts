import { Types } from "mongoose";
import { AppError } from "../../shared/errors/appError.js";
import { normalizeEmail,normalizeMobile } from "../../shared/utils/normalizeInput.js";
import { PlayerRepository } from "./player.repository.js";
import { TeamRepository } from "../teams/team.repository.js";
import { SettingsService } from "../settings/settings.service.js";
type Row=Record<string,unknown>;
const brief=(v:unknown):Row|null=>v&&typeof v==="object"&&"_id" in v?({_id:String((v as Row)._id),name:(v as Row).name,shortName:(v as Row).shortName??null,logo:(v as Row).logo??null,groupName:(v as Row).groupName??null}):null;
export class PlayerService {
  constructor(private readonly players:PlayerRepository,private readonly teams:TeamRepository,private readonly settings:SettingsService){}
  async list(query:Row,isAdmin:boolean){
    const {page=1,limit=10,search,position,status,auctionStatus}=query;const filter:Row={};
    if(search)filter.name={$regex:String(search),$options:"i"};if(position)filter.position=position;
    if(isAdmin&&status)filter.status=status;else if(!isAdmin)filter.status="active";
    if(isAdmin&&auctionStatus)filter.auctionStatus=auctionStatus;
    if(query.teamRef==="unassigned")filter.teamRef=null;else if(query.teamRef)filter.teamRef=query.teamRef;
    const result=await this.players.listPlayers(filter,Number(page),Number(limit));
    return {items:(result.items as unknown as Row[]).map(p=>this.publicMap(p,isAdmin)),total:result.total,page:Number(page),limit:Number(limit)};
  }
  publicMap(p:Row,admin=false){
    const {_id,name,position,isIconPlayer,teamRef,jerseyNo,auctionPrice,auctionStatus,status,profilePic,mobile,email,dateOfBirth}=p;
    const team=brief(teamRef);const base={_id:String(_id),name,position,isIconPlayer,teamRef:team?team._id:teamRef?String(teamRef):null,team,jerseyNo,auctionPrice,auctionStatus,status,profilePic};
    return admin?{...base,mobile,email:email??null,dateOfBirth:dateOfBirth??null}:base;
  }
  async get(id:string,isAdmin:boolean){
    if(!Types.ObjectId.isValid(id))throw new AppError("Invalid player ID",400,"INVALID_ID");
    const p=await this.players.findPlayerPopulated(id) as unknown as Row|null;
    if(!p||(!isAdmin&&p.status!=="active"))throw new AppError("Player not found",404,"NOT_FOUND");
    return this.publicMap(p,isAdmin);
  }
  async create(data:Row){
    const settings=await this.settings.get();
    if(await this.players.findByMobile(normalizeMobile(String(data.mobile))))throw new AppError("Mobile already exists",409,"DUPLICATE_MOBILE",{mobile:"Mobile already exists"});
    const email=normalizeEmail(data.email as string|null|undefined);
    if(email&&await this.players.findOne({email}))throw new AppError("Email already exists",409,"DUPLICATE_EMAIL",{email:"Email already exists"});
    if((await this.players.count({status:"active"}))>=Number(settings.maxActivePlayers)&&data.status!=="inactive")throw new AppError("Maximum active player limit reached",422,"PLAYER_LIMIT");
    if(data.status==="inactive"){
      const inactive=await this.players.create({...data,mobile:normalizeMobile(String(data.mobile)),email,teamRef:null,jerseyNo:null,auctionPrice:0,auctionStatus:"pending"});
      return this.publicMap(inactive,true);
    }
    const status=String(data.status??"active"),auctionStatus=String(data.auctionStatus??"pending");
    if(auctionStatus==="sold"){
      if(settings.auctionState!=="in_progress")throw new AppError("Start or reopen the auction before marking a player sold",409,"AUCTION_NOT_IN_PROGRESS");
      if(!data.teamRef||Number(data.auctionPrice)<=0)throw new AppError("Sold players require a team and auction price",422,"INVALID_SOLD_PLAYER");
      await this.validateAssignment(String(data.teamRef),"",Number(data.auctionPrice),Boolean(data.isIconPlayer),String(data.position),data.jerseyNo as number|null|undefined);
    }else if(data.teamRef||data.jerseyNo!==null&&data.jerseyNo!==undefined||Number(data.auctionPrice||0)!==0){
      throw new AppError("Pending and unsold players cannot have a team, jersey number or auction price",422,"INVALID_AUCTION_FIELDS");
    }
    const player=await this.players.create({
      ...data,mobile:normalizeMobile(String(data.mobile)),email,
      teamRef:auctionStatus==="sold"?data.teamRef:null,
      jerseyNo:auctionStatus==="sold"?(data.jerseyNo??null):null,
      auctionPrice:auctionStatus==="sold"?Number(data.auctionPrice):0,
      auctionStatus,status
    });
    const populated=await this.players.findPlayerPopulated(String(player._id)) as unknown as Row;
    return this.publicMap(populated,true);
  }
  async update(id:string,data:Row){
    const current=await this.players.findById(id);if(!current)throw new AppError("Player not found",404,"NOT_FOUND");
    const email=normalizeEmail(data.email as string|null|undefined);
    if(data.mobile&&normalizeMobile(String(data.mobile))!==current.mobile&&await this.players.findByMobile(normalizeMobile(String(data.mobile))))throw new AppError("Mobile already exists",409,"DUPLICATE_MOBILE",{mobile:"Mobile already exists"});
    if(email&&email!==current.email&&await this.players.findOne({email,_id:{$ne:id}}))throw new AppError("Email already exists",409,"DUPLICATE_EMAIL",{email:"Email already exists"});
    if(data.mobile)data.mobile=normalizeMobile(String(data.mobile));if("email"in data)data.email=email;
    const merged:Row={...current,...data};
    if(merged.status==="inactive"){
      merged.teamRef=null;merged.jerseyNo=null;merged.auctionPrice=0;merged.auctionStatus="pending";
      const settings=await this.settings.get();if(settings.auctionState==="completed")await this.settings.update({auctionState:"in_progress",auctionCompletedAt:null});
      const inactive=await this.players.update(id,merged);if(!inactive)throw new AppError("Player not found",404,"NOT_FOUND");
      return this.publicMap(inactive,true);
    }
    const settings=await this.settings.get();
    const sensitive=["teamRef","jerseyNo","auctionPrice","auctionStatus","isIconPlayer","position","status"];
    if(settings.auctionState==="completed"&&sensitive.some(k=>k in data))throw new AppError("Reopen the auction before changing auction-related player data",409,"AUCTION_COMPLETED");
    if(data.status==="active"&&current.status==="inactive"&&(await this.players.count({status:"active"}))>=Number(settings.maxActivePlayers))throw new AppError("Maximum active player limit reached",422,"PLAYER_LIMIT");
    if(merged.auctionStatus==="sold"){
      if(settings.auctionState!=="in_progress")throw new AppError("Start or reopen the auction before marking a player sold",409,"AUCTION_NOT_IN_PROGRESS");
      if(!merged.teamRef||Number(merged.auctionPrice)<=0)throw new AppError("Sold players require a team and auction price",422,"INVALID_SOLD_PLAYER");
      await this.validateAssignment(String(merged.teamRef),id,Number(merged.auctionPrice),Boolean(merged.isIconPlayer),String(merged.position),merged.jerseyNo as number|null|undefined);
    }else if(merged.auctionStatus==="pending"||merged.auctionStatus==="unsold"){
      merged.teamRef=null;merged.jerseyNo=null;merged.auctionPrice=0;
    }
    const updated=await this.players.update(id,merged);if(!updated)throw new AppError("Player not found",404,"NOT_FOUND");
    return this.publicMap(updated,true);
  }
  private async validateAssignment(teamId:string,playerId:string,price:number,isIcon:boolean,position:string,jerseyNo?:number|null){
    const team=await this.teams.findById(teamId);if(!team||team.status!=="active")throw new AppError("Select an active team",422,"INVALID_TEAM");
    const settings=await this.settings.get();const squad=await this.players.getTeamPlayers(teamId) as unknown as Row[];
    const existing=squad.filter(p=>String(p._id)!==playerId);
    if(existing.length>=Number(settings.maxPlayersPerTeam))throw new AppError("Team squad limit reached",422,"SQUAD_LIMIT");
    const cost=existing.reduce((sum,p)=>sum+Number(p.auctionPrice||0),0);if(cost+price>Number(settings.auctionBudgetPerTeam))throw new AppError("Team auction budget exceeded",422,"BUDGET_EXCEEDED");
    if(isIcon&&existing.some(p=>p.isIconPlayer))throw new AppError("Team already has an icon player",422,"ICON_LIMIT");
    if(position==="GK"&&existing.some(p=>p.position==="GK"))throw new AppError("Team already has a goalkeeper",422,"GOALKEEPER_LIMIT");
    if(jerseyNo!==null&&jerseyNo!==undefined&&await this.players.findDuplicateJersey(teamId,jerseyNo,playerId||undefined))throw new AppError("Jersey number already used in this team",409,"DUPLICATE_JERSEY",{jerseyNo:"Jersey number already used in this team"});
  }
  async assign(id:string,data:{teamRef:string;auctionPrice:number;jerseyNo?:number|null}){
    const p=await this.players.findById(id);if(!p||p.status!=="active")throw new AppError("Active player not found",404,"PLAYER_NOT_FOUND");
    const settings=await this.settings.get();if(settings.auctionState!=="in_progress")throw new AppError("Start or reopen the auction before making assignments",409,"AUCTION_NOT_IN_PROGRESS");
    await this.validateAssignment(data.teamRef,id,data.auctionPrice,Boolean(p.isIconPlayer),String(p.position),data.jerseyNo);
    const updated=await this.players.update(id,{teamRef:data.teamRef,auctionPrice:data.auctionPrice,jerseyNo:data.jerseyNo??null,auctionStatus:"sold"});
    return this.publicMap(updated!,true);
  }
  async markUnsold(id:string){
    const settings=await this.settings.get();if(settings.auctionState!=="in_progress")throw new AppError("Start or reopen the auction before changing auction results",409,"AUCTION_NOT_IN_PROGRESS");
    const p=await this.players.findById(id);if(!p)throw new AppError("Player not found",404,"NOT_FOUND");
    const updated=await this.players.update(id,{teamRef:null,jerseyNo:null,auctionPrice:0,auctionStatus:"unsold"});
    return this.publicMap(updated!,true);
  }
  async deactivate(id:string){
    const current=await this.players.findById(id);if(!current)throw new AppError("Player not found",404,"NOT_FOUND");
    const settings=await this.settings.get();if(settings.auctionState==="completed")await this.settings.update({auctionState:"in_progress",auctionCompletedAt:null});
    const p=await this.players.update(id,{status:"inactive",teamRef:null,jerseyNo:null,auctionPrice:0,auctionStatus:"pending"});
    if(!p)throw new AppError("Player not found",404,"NOT_FOUND");return this.publicMap(p,true);
  }
  async remove(id:string){
    const p=await this.players.findById(id);if(!p)throw new AppError("Player not found",404,"NOT_FOUND");
    if(await this.players.countGoalReferences(id))throw new AppError("Player is referenced by match goals. Deactivate instead.",409,"PLAYER_REFERENCED");
    await this.players.remove(id);return null;
  }
}
