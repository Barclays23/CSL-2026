import type { Types } from "mongoose";
import type { MatchStage, MatchStatus, GoalType } from "./match.types.js";

export interface PenaltyShootoutDto { team1Score: number; team2Score: number; }
export interface CreateMatchDto {
  matchNo: string;
  stage: MatchStage;
  groupName?: string | null;
  kickoffAt: Date;
  venue?: string | null;
  team1Ref: string;
  team2Ref: string;
  status: MatchStatus;
  penaltyShootout?: PenaltyShootoutDto | null;
  notes?: string | null;
}
export type UpdateMatchDto = Partial<CreateMatchDto>;
export interface MatchQueryDto {
  page: number;
  limit: number;
  stage?: MatchStage;
  groupName?: string;
  status?: MatchStatus;
  search?: string;
}
export interface GoalDto {
  scoringTeamRef: string;
  goalType: GoalType;
  scorerRef?: string | null;
  ownGoalPlayerRef?: string | null;
}
export type MatchCreateInput = CreateMatchDto;
export type MatchUpdateInput = UpdateMatchDto;
export type MatchQueryInput = MatchQueryDto;
export type GoalInput = GoalDto;
export type MatchCreateDTO = CreateMatchDto;
export type MatchUpdateDTO = UpdateMatchDto;
export type MatchQueryDTO = MatchQueryDto;
export type GoalCreateDTO = GoalDto;
export type GoalUpdateDTO = GoalDto;

import type { Asset } from "../../shared/types/common.types.js";
import type { TeamBriefDTO } from "../teams/team.types.js";

export interface MatchPlayerBriefDTO {
  _id: string;
  name: string;
  position: "GK" | "DF" | "MF" | "FW";
  jerseyNo: number | null;
  profilePic: Asset | null;
  teamRef: string | null;
}

export interface MatchGoalDTO {
  _id: string;
  scoringTeamRef: string | TeamBriefDTO;
  goalType: GoalType;
  scorerRef: string | MatchPlayerBriefDTO | null;
  ownGoalPlayerRef: string | MatchPlayerBriefDTO | null;
  createdAt: string;
}

export interface MatchResponseDTO {
  _id: string;
  matchNo: string;
  stage: MatchStage;
  groupName: string | null;
  kickoffAt: string;
  venue: string | null;
  team1Ref: string | TeamBriefDTO;
  team2Ref: string | TeamBriefDTO;
  status: MatchStatus;
  goals: MatchGoalDTO[];
  penaltyShootout: { team1Score: number; team2Score: number } | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}
