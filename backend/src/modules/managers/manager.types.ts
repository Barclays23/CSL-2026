import type { Types } from "mongoose";
import type { Asset } from "../../shared/types/common.types.js";
export interface ManagerFields {
  name:string;mobile:string;email:string|null;dateOfBirth:Date|null;teamRef:Types.ObjectId|null;
  role:string|null;profilePic:Asset|null;status:"active"|"inactive";
}
export type PublicManagerDTO=Pick<ManagerFields,"name"|"teamRef"|"role"|"profilePic"|"status"> & {_id:string;team?:unknown|null;};
export type AdminManagerDTO=PublicManagerDTO & Pick<ManagerFields,"mobile"|"email"|"dateOfBirth">;
