import type { Types } from "mongoose";
import type { Asset } from "../../shared/types/common.types.js";
import type { TeamBriefDTO } from "../teams/team.types.js";
export interface ManagerFields { name: string; mobile: string; email: string | null; dateOfBirth: Date | null; teamRef: Types.ObjectId | null; role: string | null; profilePic: Asset | null; status: "active" | "inactive"; }
export interface PublicManagerDTO { _id: string; name: string; teamRef: string | null; team: TeamBriefDTO | null; role: string | null; profilePic: Asset | null; status: "active" | "inactive"; }
export interface AdminManagerDTO extends PublicManagerDTO { mobile: string; email: string | null; dateOfBirth: Date | null; }
