import { Types } from "mongoose";
import { AppError } from "../../shared/errors/appError.js";
import { MatchRepository } from "./match.repository.js";
import { TeamRepository } from "../teams/team.repository.js";
import { PlayerRepository } from "../players/player.repository.js";
type Row=Record<string,unknown>;
const idOf=(v:unknown)=>String(v&&typeof v==="object"&&"_id"in v?(v as Row)._id:v);
export class MatchService {
  constructor(private readonly matches:MatchRepository,private readonly teams:TeamRepository,private readonly players:PlayerRepository){}
  async list(q:Row){
    const filter:Row={};for(const k of ["stage","groupName","status"] as const)if(q[k])filter[k]=q[k];
    if(q.search){const term=String(q.search);const found=await this.teams.list({status:"active",name:{$regex:term,$options:"i"}},1,100);const ids=found.items.map(t=>t._id);filter.$or=[{matchNo:{$regex:term,$options:"i"}},{team1Ref:{$in:ids}},{team2Ref:{$in:ids}}];}
    const r=await this.matches.listPopulated(filter,Number(q.page||1),Number(q.limit||20));
    return {items:r.items,total:r.total,page:Number(q.page||1),limit:Number(q.limit||20)};
  }
  async get(id:string){if(!Types.ObjectId.isValid(id))throw new AppError("Invalid match ID",400,"INVALID_ID");const m=await this.matches.getPopulated(id);if(!m)throw new AppError("Match not found",404,"NOT_FOUND");return m;}
  async create(data:Row){
    if(data.stage!=="group")data.groupName=null;
    await this.validateTeams(String(data.team1Ref),String(data.team2Ref),String(data.stage),data.groupName as string|null);
    if(await this.matches.findOne({matchNo:String(data.matchNo)}))throw new AppError("Match number already exists",409,"DUPLICATE_MATCH");
    if(data.stage!=="group"&&data.status==="completed")throw new AppError("Create a knockout match as scheduled, enter goals, then complete it with a shootout if tied",422,"INVALID_COMPLETION");
    if(data.stage==="group"&&data.penaltyShootout)throw new AppError("Group matches cannot have a penalty shootout",422,"GROUP_SHOOTOUT");
    const m=await this.matches.create({...data,goals:[],penaltyShootout:null});return this.matches.getPopulated(String(m._id));
  }
  async update(id:string,data:Row){
    const old=await this.matches.findById(id);if(!old)throw new AppError("Match not found",404,"NOT_FOUND");
    const merged={...old,...data};
    if(merged.stage!=="group")merged.groupName=null;
    await this.validateTeams(String(merged.team1Ref),String(merged.team2Ref),String(merged.stage),merged.groupName as string|null);
    const oldGoals=Array.isArray(old.goals)?old.goals as Row[]:[];
    if(oldGoals.length&&(String(merged.team1Ref)!==String(old.team1Ref)||String(merged.team2Ref)!==String(old.team2Ref)))throw new AppError("Remove or reassign the existing goal entries before changing the match teams",409,"MATCH_HAS_GOALS");
    if(data.matchNo&&String(data.matchNo)!==String(old.matchNo)&&await this.matches.findOne({matchNo:String(data.matchNo)}))throw new AppError("Match number already exists",409,"DUPLICATE_MATCH");
    this.validateCompletedResult(merged,oldGoals);
    const payload={...data,...(merged.stage!=="group"?{groupName:null}:{})};
    const updated=await this.matches.update(id,payload);if(!updated)throw new AppError("Match not found",404,"NOT_FOUND");
    return this.matches.getPopulated(id);
  }
  private validateCompletedResult(match:Row,goals:Row[]){
    if(match.stage==="group"&&match.penaltyShootout)throw new AppError("Group matches cannot have a penalty shootout",422,"GROUP_SHOOTOUT");
    if(match.status!=="completed"||match.stage==="group")return;
    const a=String(match.team1Ref),b=String(match.team2Ref);
    const scoreA=goals.filter(g=>idOf(g.scoringTeamRef)===a).length,scoreB=goals.filter(g=>idOf(g.scoringTeamRef)===b).length;
    const shootout=match.penaltyShootout as Row|null;
    if(scoreA===scoreB&&(!shootout||Number(shootout.team1Score)===Number(shootout.team2Score)))throw new AppError("A tied completed knockout match requires a shootout with a winner",422,"SHOOTOUT_REQUIRED");
    if(scoreA!==scoreB&&shootout)throw new AppError("Penalty shootout is only allowed when normal-time score is tied",422,"UNNECESSARY_SHOOTOUT");
  }
  private async validateTeams(one:string,two:string,stage:string,group:string|null){
    if(one===two)throw new AppError("A team cannot play itself",422,"SAME_TEAMS");
    const [a,b]=await Promise.all([this.teams.findById(one),this.teams.findById(two)]);
    if(!a||a.status!=="active"||!b||b.status!=="active")throw new AppError("Both teams must be active",422,"INVALID_TEAMS");
    if(stage==="group"){if(!group)throw new AppError("Group name is required",422,"GROUP_REQUIRED");if(a.groupName!==group||b.groupName!==group)throw new AppError("Both teams must belong to the selected group",422,"GROUP_MISMATCH");}
  }
  async delete(id:string){const m=await this.matches.remove(id);if(!m)throw new AppError("Match not found",404,"NOT_FOUND");return null;}
  async addGoal(matchId:string,data:Row){
    const match=await this.matches.findById(matchId);if(!match)throw new AppError("Match not found",404,"NOT_FOUND");await this.validateGoal(match,data);
    const goals=[...(Array.isArray(match.goals)?match.goals as Row[]:[]),data];this.validateCompletedResult(match,goals);return this.matches.addGoal(matchId,data);
  }
  async updateGoal(matchId:string,goalId:string,data:Row){
    const match=await this.matches.findById(matchId);if(!match)throw new AppError("Match not found",404,"NOT_FOUND");await this.validateGoal(match,data);
    const goals=(Array.isArray(match.goals)?match.goals as Row[]:[]).map(g=>String(g._id)===goalId?data:g);this.validateCompletedResult(match,goals);
    const result=await this.matches.updateGoal(matchId,goalId,data);if(!result)throw new AppError("Goal not found",404,"GOAL_NOT_FOUND");return result;
  }
  async deleteGoal(matchId:string,goalId:string){
    const match=await this.matches.findById(matchId);if(!match)throw new AppError("Match not found",404,"NOT_FOUND");
    const goals=(Array.isArray(match.goals)?match.goals as Row[]:[]).filter(g=>String(g._id)!==goalId);this.validateCompletedResult(match,goals);
    const result=await this.matches.deleteGoal(matchId,goalId);if(!result)throw new AppError("Match or goal not found",404,"GOAL_NOT_FOUND");return result;
  }
  private async validateGoal(match:Row,goal:Row){
    const team1=String(match.team1Ref),team2=String(match.team2Ref),scoring=String(goal.scoringTeamRef);
    if(scoring!==team1&&scoring!==team2)throw new AppError("Scoring team must be one of the match teams",422,"INVALID_SCORING_TEAM");
    if(goal.goalType==="normal"){
      if(!goal.scorerRef)throw new AppError("Select a goal scorer",422,"SCORER_REQUIRED");
      const p=await this.players.findById(String(goal.scorerRef));
      if(!p||p.status!=="active"||String(p.teamRef)!==scoring)throw new AppError("Normal scorer must be an active player in the scoring team",422,"INVALID_SCORER");
      goal.ownGoalPlayerRef=null;
    }else{
      if(!goal.ownGoalPlayerRef)throw new AppError("Select the own-goal player",422,"OWN_GOAL_PLAYER_REQUIRED");
      const p=await this.players.findById(String(goal.ownGoalPlayerRef)),opposing=scoring===team1?team2:team1;
      if(!p||String(p.teamRef)!==opposing)throw new AppError("Own-goal player must belong to the opposing team",422,"INVALID_OWN_GOAL_PLAYER");
      goal.scorerRef=null;
    }
  }
}
