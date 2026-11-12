import { AppError } from "../../shared/errors/appError.js";
import { TeamRepository } from "./team.repository.js";
import { PlayerRepository } from "../players/player.repository.js";
import { SettingsService } from "../settings/settings.service.js";
export class TeamService {
  constructor(private readonly _teamRepo:TeamRepository,private readonly _playerRepo:PlayerRepository,private readonly _settingsService:SettingsService){}
  async list(query:Record<string,unknown>={},admin=false){
    const filter:Record<string,unknown>={};if(query.status&&admin)filter.status=query.status;else if(!admin)filter.status="active";
    if(query.search)filter.name={$regex:String(query.search),$options:"i"};if(query.groupName)filter.groupName=query.groupName;
    const r=await this._teamRepo.list(filter,Number(query.page||1),Number(query.limit||50),{name:1});
    return {items:r.items,total:r.total,page:Number(query.page||1),limit:Number(query.limit||50)};
  }
  async get(id:string){const team=await this._teamRepo.findById(id);if(!team||team.status!=="active")throw new AppError("Team not found",404,"NOT_FOUND");return team;}
  async create(data:Record<string,unknown>){
    const settings=await this._settingsService.get();if(data.status!=="inactive"&&await this._teamRepo.countActive()>=Number(settings.maxActiveTeams))throw new AppError("Maximum active team limit reached",422,"TEAM_LIMIT");
    if(await this._teamRepo.findByName(String(data.name)))throw new AppError("Team name already exists",409,"DUPLICATE_TEAM",{name:"Team name already exists"});
    return this._teamRepo.create(data);
  }
  async update(id:string,data:Record<string,unknown>){
    const current=await this._teamRepo.findById(id);if(!current)throw new AppError("Team not found",404,"NOT_FOUND");
    if(data.name&&String(data.name).trim().toLowerCase()!==String(current.name).toLowerCase()){
      const duplicate=await this._teamRepo.findByName(String(data.name));
      if(duplicate&&String(duplicate._id)!==id)throw new AppError("Team name already exists",409,"DUPLICATE_TEAM",{name:"Team name already exists"});
    }
    if(data.status==="active"&&current.status!=="active"){const settings=await this._settingsService.get();if(await this._teamRepo.countActive()>=Number(settings.maxActiveTeams))throw new AppError("Maximum active team limit reached",422,"TEAM_LIMIT");}
    if(data.status==="inactive"){
      const refs=await this._teamRepo.findReferenced(id);
      if(refs.players||refs.managers||refs.matches)throw new AppError("Resolve this team's players, managers and fixtures before deactivating it",409,"TEAM_REFERENCED");
    }
    const updated=await this._teamRepo.update(id,data);if(!updated)throw new AppError("Team not found",404,"NOT_FOUND");return updated;
  }
  async remove(id:string){
    const refs=await this._teamRepo.findReferenced(id);if(refs.players||refs.matches||refs.managers)throw new AppError("Team has player, manager or match references",409,"TEAM_REFERENCED");
    const t=await this._teamRepo.remove(id);if(!t)throw new AppError("Team not found",404,"NOT_FOUND");return null;
  }
  async auctionSummary(){
    const settings=await this._settingsService.get();const teamList=await this._teamRepo.list({status:"active"},1,100,{name:1});
    const rows=await Promise.all(teamList.items.map(async team=>{
      const players=await this._playerRepo.getTeamPlayers(String(team._id)) as unknown as Record<string,unknown>[];
      const purchaseCost=players.reduce((sum,p)=>sum+Number(p.auctionPrice||0),0);
      const playerCount=players.length,budget=Number(settings.auctionBudgetPerTeam),maxPlayers=Number(settings.maxPlayersPerTeam);
      const teamBrief={_id:String(team._id),name:team.name,shortName:team.shortName??null,logo:team.logo??null,groupName:team.groupName??null};
      return {team,players:players.map(p=>({_id:String(p._id),name:p.name,position:p.position,isIconPlayer:p.isIconPlayer,teamRef:String(p.teamRef),team:teamBrief,jerseyNo:p.jerseyNo,auctionPrice:p.auctionPrice,auctionStatus:p.auctionStatus,status:p.status,profilePic:p.profilePic})),stats:{auctionBudget:budget,purchaseCost,remainingBalance:budget-purchaseCost,playerCount,remainingSlots:maxPlayers-playerCount,averagePurchaseCost:playerCount?purchaseCost/playerCount:0,iconPlayerCount:players.filter(p=>p.isIconPlayer).length,goalkeeperCount:players.filter(p=>p.position==="GK").length,maxPlayers,requiredIcons:Number(settings.requiredIconPlayers),requiredGoalkeepers:Number(settings.requiredGoalkeepers)}};
    }));
    const totals=await this._playerRepo.auctionCounts();return {totals:{...totals,activeTeams:teamList.total},teams:rows};
  }
}
