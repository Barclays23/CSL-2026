import type { Types } from "mongoose";
import type { Asset } from "../../shared/types/common.types.js";
import type { PlayerTeamBriefDTO } from "../players/player.types.js";

export type ManagerStatus = "active" | "inactive";

export interface ManagerFields {
  name: string;
  mobile: string;
  email: string | null;
  dateOfBirth: Date | null;
  teamRef: Types.ObjectId | null;
  role: string | null;
  profilePic: Asset | null;
  status: ManagerStatus;
}

export interface PublicManagerDTO {
  _id: string;
  name: string;
  teamRef: string | null;
  team: PlayerTeamBriefDTO | null;
  role: string | null;
  profilePic: Asset | null;
  status: ManagerStatus;
}

export interface AdminManagerDTO extends PublicManagerDTO {
  mobile: string;
  email: string | null;
  dateOfBirth: string | null;
}

export type ManagerResponseDTO = PublicManagerDTO | AdminManagerDTO;
