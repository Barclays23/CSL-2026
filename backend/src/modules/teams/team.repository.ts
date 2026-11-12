import { Types } from "mongoose";
import { TeamModel } from "./team.model.js";
import type { TeamRecord } from "./team.model.js";
import { PlayerModel } from "../players/player.model.js";
import { ManagerModel } from "../managers/manager.model.js";
import { MatchModel } from "../matches/match.model.js";
import { CrudRepository } from "../../shared/utils/crud.repository.js";
export class TeamRepository extends CrudRepository<TeamRecord> {
  constructor(){super(TeamModel);}
  async findByName(name:string){return this.findOne({name:{$regex:"^"+name+"$",$options:"i"}});}
  async countActive(){return this.count({status:"active"});}
  async findReferenced(id:string){
    const oid=new Types.ObjectId(id);
    const [players,matches,managers]=await Promise.all([
      PlayerModel.countDocuments({teamRef:oid}),
      MatchModel.countDocuments({$or:[{team1Ref:oid},{team2Ref:oid}]}),
      ManagerModel.countDocuments({teamRef:oid})
    ]);
    return {players,matches,managers};
  }
}
