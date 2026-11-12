import { MatchModel } from "../matches/match.model.js";
import { PlayerModel } from "./player.model.js";
import { CrudRepository } from "../../shared/utils/crud.repository.js";
export class PlayerRepository extends CrudRepository {
  constructor(){super(PlayerModel);}
  async listPlayers(filter:Record<string,unknown>,page=1,limit=10,sort:Record<string,1|-1>={name:1}){
    const [items,total]=await Promise.all([
      PlayerModel.find(filter as never).sort(sort).skip((page-1)*limit).limit(limit).populate({path:"teamRef",select:"name shortName logo groupName"}).lean().exec(),
      PlayerModel.countDocuments(filter as never).exec()
    ]);
    return {items,total};
  }
  async findPlayerPopulated(id:string){return PlayerModel.findById(id).populate({path:"teamRef",select:"name shortName logo groupName"}).lean().exec();}
  async findByMobile(mobile:string){return this.findOne({mobile});}
  async findDuplicateJersey(teamRef:string,jerseyNo:number,excludeId?:string){
    const filter:Record<string,unknown>={teamRef,jerseyNo};if(excludeId)filter._id={$ne:excludeId};return this.findOne(filter);
  }
  async getTeamPlayers(teamRef:string){return PlayerModel.find({teamRef,status:"active",auctionStatus:"sold"}).sort({name:1}).lean().exec();}
  async countGoalReferences(id:string){const [normal,own]=await Promise.all([MatchModel.countDocuments({"goals.scorerRef":id}),MatchModel.countDocuments({"goals.ownGoalPlayerRef":id})]);return normal+own;}
  async auctionCounts(){
    const [active,pending,sold,unsold,spend]=await Promise.all([
      this.count({status:"active"}),this.count({status:"active",auctionStatus:"pending"}),
      this.count({status:"active",auctionStatus:"sold"}),this.count({status:"active",auctionStatus:"unsold"}),
      PlayerModel.aggregate([{$match:{status:"active",auctionStatus:"sold"}},{$group:{_id:null,total:{$sum:"$auctionPrice"}}}]).exec()
    ]);
    return {activeAuctionPlayers:active,pendingPlayers:pending,soldPlayers:sold,unsoldPlayers:unsold,totalAuctionSpend:Number(spend[0]?.total??0)};
  }
  async invalidSoldCount(){return this.count({status:"active",auctionStatus:"sold",$or:[{teamRef:null},{auctionPrice:{$lte:0}}]});}
}
