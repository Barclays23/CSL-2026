import type { Types } from "mongoose";
import type { Asset } from "../../shared/types/common.types.js";
import type { MatchCreateInput, MatchQueryInput, MatchUpdateInput, GoalInput } from "./match.dto.js";
import type { TeamBriefDTO } from "../teams/team.types.js";

export type MatchStage = "group" | "quarter_final" | "semi_final" | "final";
export type MatchStatus = "scheduled" | "live" | "completed" | "postponed" | "cancelled";
export type GoalType = "normal" | "own_goal";

export interface GoalFields {
  _id?: Types.ObjectId;
  scoringTeamRef: Types.ObjectId;
  goalType: GoalType;
  scorerRef: Types.ObjectId | null;
  ownGoalPlayerRef: Types.ObjectId | null;
  createdAt?: Date;
}

export interface MatchFields {
  matchNo: string;
  stage: MatchStage;
  groupName: string | null;
  kickoffAt: Date;
  venue: string | null;
  team1Ref: Types.ObjectId;
  team2Ref: Types.ObjectId;
  status: MatchStatus;
  goals: GoalFields[];
  penaltyShootout: { team1Score: number; team2Score: number } | null;
  notes: string | null;
}

export interface MatchEntity extends MatchFields {
  _id: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export interface PlayerBriefEntity {
  _id: Types.ObjectId;
  name: string;
  position: "GK" | "DF" | "MF" | "FW";
  jerseyNo: number | null;
  profilePic: Asset | null;
  teamRef: Types.ObjectId | null;
}

export interface GoalDTO {
  _id: string;
  scoringTeamRef: string | TeamBriefDTO;
  goalType: GoalType;
  scorerRef: string | PlayerBriefEntity | null;
  ownGoalPlayerRef: string | PlayerBriefEntity | null;
  createdAt: Date;
}

export interface PopulatedMatchEntity extends Omit<MatchEntity, "team1Ref" | "team2Ref" | "goals"> {
  team1Ref: Types.ObjectId | TeamBriefDTO;
  team2Ref: Types.ObjectId | TeamBriefDTO;
  goals: GoalDTO[];
}

export type MatchCreateDTO = MatchCreateInput;
export type MatchUpdateDTO = MatchUpdateInput;
export type MatchQueryDTO = MatchQueryInput;
export type GoalCreateDTO = GoalInput;
export type GoalUpdateDTO = GoalInput;

export interface MatchListFilter {
  stage?: MatchStage;
  groupName?: string;
  status?: MatchStatus;
  $or?: Array<{ matchNo?: { $regex: string; $options: "i" }; team1Ref?: { $in: Types.ObjectId[] }; team2Ref?: { $in: Types.ObjectId[] } }>;
}

export interface MatchRepositoryContract {
  findMatches(filter: MatchListFilter, page: number, limit: number): Promise<{ items: PopulatedMatchEntity[]; total: number }>;
  findMatchById(matchId: string): Promise<MatchEntity | null>;
  findMatchWithTeamsAndGoals(matchId: string): Promise<PopulatedMatchEntity | null>;
  findMatchByNumber(matchNo: string): Promise<MatchEntity | null>;
  createMatch(data: MatchFields): Promise<MatchEntity>;
  updateMatch(matchId: string, data: Partial<MatchFields>): Promise<MatchEntity | null>;
  deleteMatch(matchId: string): Promise<boolean>;
  appendGoal(matchId: string, goal: GoalFields): Promise<PopulatedMatchEntity | null>;
  updateMatchGoal(matchId: string, goalId: string, goal: Partial<GoalFields>): Promise<PopulatedMatchEntity | null>;
  removeMatchGoal(matchId: string, goalId: string): Promise<PopulatedMatchEntity | null>;
}
