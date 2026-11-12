import type { Types } from "mongoose";
import type { Asset } from "../../shared/types/common.types.js";
export type TeamStatus="active"|"inactive";
export interface TeamFields {
  name:string;shortName:string|null;logo:Asset|null;poster:Asset|null;groupName:string|null;status:TeamStatus;
}
export interface TeamDTO extends TeamFields {_id:string;createdAt:Date;updatedAt:Date;}
export interface TeamAuctionStats {
  auctionBudget:number;purchaseCost:number;remainingBalance:number;playerCount:number;remainingSlots:number;
  averagePurchaseCost:number;iconPlayerCount:number;goalkeeperCount:number;maxPlayers:number;requiredIcons:number;requiredGoalkeepers:number;
}
export interface TeamAuctionCardDTO {team:TeamDTO;players:unknown[];stats:TeamAuctionStats;}
export type TeamId=Types.ObjectId;
