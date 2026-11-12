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
  status?: MatchStatus;
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
