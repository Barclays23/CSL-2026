import { AppError } from "../../shared/errors/appError.js";
import { SettingsService } from "../settings/settings.service.js";
import { TeamRepository } from "../teams/team.repository.js";
import { PlayerRepository } from "../players/player.repository.js";
export class AuctionService {
  constructor(private readonly settings:SettingsService,private readonly teams:TeamRepository,private readonly players:PlayerRepository){}
  async start(){const s=await this.settings.get();if(s.auctionState==="completed")throw new AppError("Reopen the auction before starting it",409,"AUCTION_COMPLETED");return this.settings.update({auctionState:"in_progress",auctionCompletedAt:null});}
  async reopen(){return this.settings.update({auctionState:"in_progress",auctionCompletedAt:null});}
  async complete(){
    const s=await this.settings.get();
    if(s.auctionState!=="in_progress")throw new AppError("Start or reopen the auction before completing it",409,"AUCTION_NOT_IN_PROGRESS");
    const teamRows=await this.teams.list({status:"active"},1,100,{name:1});
    const errors:{team:string;message:string}[]=[];
    if(teamRows.total!==Number(s.maxActiveTeams))errors.push({team:"Tournament",message:`Expected ${s.maxActiveTeams} active teams; found ${teamRows.total}`});
    if(await this.players.count({status:"active"})>Number(s.maxActivePlayers))errors.push({team:"Auction",message:"Active player limit exceeded"});
    for(const t of teamRows.items){
      const players=await this.players.getTeamPlayers(String(t._id)) as unknown as Record<string,unknown>[];
      const spend=players.reduce((n,p)=>n+Number(p.auctionPrice||0),0);
      const icons=players.filter(p=>p.isIconPlayer).length,gks=players.filter(p=>p.position==="GK").length;
      if(players.length!==Number(s.maxPlayersPerTeam))errors.push({team:String(t.name),message:`Squad has ${players.length}; requires exactly ${s.maxPlayersPerTeam}`});
      if(spend>Number(s.auctionBudgetPerTeam))errors.push({team:String(t.name),message:"Auction budget exceeded"});
      if(icons!==Number(s.requiredIconPlayers))errors.push({team:String(t.name),message:`Requires ${s.requiredIconPlayers} icon player(s); found ${icons}`});
      if(gks!==Number(s.requiredGoalkeepers))errors.push({team:String(t.name),message:`Requires ${s.requiredGoalkeepers} goalkeeper(s); found ${gks}`});
    }
    if(await this.players.invalidSoldCount())errors.push({team:"Auction",message:"One or more sold players have no team or an invalid auction price"});
    const pending=await this.players.count({status:"active",auctionStatus:"pending"});
    if(pending)errors.push({team:"Auction",message:`${pending} active player(s) are still pending`});
    if(errors.length)throw new AppError("Auction completion failed",422,"AUCTION_VALIDATION_FAILED",{auction:JSON.stringify(errors)});
    return this.settings.update({auctionState:"completed",auctionCompletedAt:new Date()});
  }
}
