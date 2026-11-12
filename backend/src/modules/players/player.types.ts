import type { Types } from "mongoose";
import type { Asset } from "../../shared/types/common.types.js";
export type PlayerPosition="GK"|"DF"|"MF"|"FW";
export type PlayerStatus="active"|"inactive";
export type AuctionStatus="pending"|"sold"|"unsold";
export interface PlayerFields {
  name:string;mobile:string;email:string|null;dateOfBirth:Date|null;position:PlayerPosition;
  isIconPlayer:boolean;teamRef:Types.ObjectId|null;jerseyNo:number|null;auctionPrice:number;
  auctionStatus:AuctionStatus;status:PlayerStatus;profilePic:Asset|null;
}
export interface PlayerPublicDTO extends Omit<PlayerFields,"mobile"|"email"|"dateOfBirth"> {_id:string;team?:unknown|null;}
export interface PlayerAdminDTO extends PlayerPublicDTO {mobile:string;email:string|null;dateOfBirth:Date|null;}
