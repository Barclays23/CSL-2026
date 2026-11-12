import { MatchModel } from "./match.model.js";
import type { MatchRecord } from "./match.model.js";
import { CrudRepository } from "../../shared/utils/crud.repository.js";
const publicPopulates=[
  {path:"team1Ref",select:"name shortName logo groupName"},
  {path:"team2Ref",select:"name shortName logo groupName"},
  {path:"goals.scoringTeamRef",select:"name shortName logo groupName"},
  {path:"goals.scorerRef",select:"name position jerseyNo profilePic teamRef"},
  {path:"goals.ownGoalPlayerRef",select:"name position jerseyNo profilePic teamRef"}
];
export class MatchRepository extends CrudRepository<MatchRecord> {
  constructor(){super(MatchModel);}
  async listPopulated(filter:Record<string,unknown>,page=1,limit=20){
    const [items,total]=await Promise.all([
      MatchModel.find(filter as never).sort({kickoffAt:1}).skip((page-1)*limit).limit(limit).populate(publicPopulates).lean().exec(),
      MatchModel.countDocuments(filter as never).exec()
    ]);
    return {items,total};
  }
  async getPopulated(id:string){return MatchModel.findById(id).populate(publicPopulates).lean().exec();}
  async addGoal(matchId:string,goal:Record<string,unknown>){return MatchModel.findByIdAndUpdate(matchId,{$push:{goals:goal}},{new:true,runValidators:true}).populate(publicPopulates).exec();}
  async updateGoal(matchId:string,goalId:string,goal:Record<string,unknown>){
    const sets=Object.fromEntries(Object.entries(goal).map(([k,v])=>[`goals.$.${k}`,v]));
    return MatchModel.findOneAndUpdate({_id:matchId,"goals._id":goalId},{$set:sets},{new:true,runValidators:true}).populate(publicPopulates).exec();
  }
  async deleteGoal(matchId:string,goalId:string){return MatchModel.findByIdAndUpdate(matchId,{$pull:{goals:{_id:goalId}}},{new:true}).populate(publicPopulates).exec();}
}
