import { MatchModel } from "../matches/match.model.js";
import { PlayerModel } from "../players/player.model.js";
import { TeamModel } from "../teams/team.model.js";
export class StatisticsRepository {
  async completedMatches(){return MatchModel.find({status:"completed"}).populate("team1Ref team2Ref goals.scoringTeamRef goals.scorerRef goals.ownGoalPlayerRef").lean().exec();}
  async completedGroupMatches(){return MatchModel.find({status:"completed",stage:"group"}).populate("team1Ref team2Ref").lean().exec();}
  async topScorerRows(){
    return MatchModel.aggregate([
      {$match:{status:"completed"}},{$unwind:"$goals"},
      {$match:{"goals.goalType":"normal","goals.scorerRef":{$ne:null}}},
      {$group:{_id:"$goals.scorerRef",goals:{$sum:1}}},{$sort:{goals:-1}}
    ]).exec();
  }
  async teamScorers(){return PlayerModel.find().select("name position profilePic teamRef jerseyNo isIconPlayer status auctionStatus auctionPrice").lean().exec();}
  async activeTeams(){return TeamModel.find({status:"active"}).sort({name:1}).lean().exec();}
  async activeTeamById(id:string){return TeamModel.findOne({_id:id,status:"active"}).lean().exec();}
  async upcomingFixtures(){return MatchModel.find({status:"scheduled"}).sort({kickoffAt:1}).limit(4).populate("team1Ref team2Ref").lean().exec();}
  async recentResults(){return MatchModel.find({status:"completed"}).sort({updatedAt:-1}).limit(4).populate([
    {path:"team1Ref",select:"name shortName logo groupName"},
    {path:"team2Ref",select:"name shortName logo groupName"},
    {path:"goals.scoringTeamRef",select:"name shortName logo groupName"},
    {path:"goals.scorerRef",select:"name position jerseyNo profilePic teamRef"},
    {path:"goals.ownGoalPlayerRef",select:"name position jerseyNo profilePic teamRef"}
  ]).lean().exec();}
  async upcomingCount(){return MatchModel.countDocuments({status:"scheduled"});}
  async completedCount(){return MatchModel.countDocuments({status:"completed"});}
}
