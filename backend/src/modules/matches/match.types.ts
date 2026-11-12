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

export interface MatchTeamReferenceEntity {
  _id: Types.ObjectId;
  name: string;
  shortName: string | null;
  logo: Asset | null;
  groupName: string | null;
}

export interface MatchPlayerReferenceEntity {
  _id: Types.ObjectId;
  name: string;
  position: "GK" | "DF" | "MF" | "FW";
  jerseyNo: number | null;
  profilePic: Asset | null;
  teamRef: Types.ObjectId | null;
}

export interface PopulatedGoalEntity extends Omit<GoalFields, "_id" | "scoringTeamRef" | "scorerRef" | "ownGoalPlayerRef"> {
  _id: Types.ObjectId;
  scoringTeamRef: Types.ObjectId | MatchTeamReferenceEntity;
  scorerRef: Types.ObjectId | MatchPlayerReferenceEntity | null;
  ownGoalPlayerRef: Types.ObjectId | MatchPlayerReferenceEntity | null;
  createdAt: Date;
}

export interface PopulatedMatchEntity extends Omit<MatchEntity, "team1Ref" | "team2Ref" | "goals"> {
  team1Ref: Types.ObjectId | MatchTeamReferenceEntity;
  team2Ref: Types.ObjectId | MatchTeamReferenceEntity;
  goals: PopulatedGoalEntity[];
}

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

export type MatchCreateDTO = MatchCreateInput;
export type MatchUpdateDTO = MatchUpdateInput;
export type MatchQueryDTO = MatchQueryInput;
export type GoalCreateDTO = GoalInput;
export type GoalUpdateDTO = GoalInput;

export interface MatchListFilter {
  stage?: MatchStage;
  groupName?: string;
  status?: MatchStatus;
  matchNo?: { $regex: string; $options: "i" };
  team1Ref?: { $in: Types.ObjectId[] };
  team2Ref?: { $in: Types.ObjectId[] };
  $or?: MatchListFilter[];
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
  updateMatchGoal(matchId: string, goalId: string, goal: GoalFields): Promise<PopulatedMatchEntity | null>;
  removeMatchGoal(matchId: string, goalId: string): Promise<PopulatedMatchEntity | null>;
}

export interface IMatchService {
  getMatches(query: MatchQueryDTO): Promise<import("../../shared/types/common.types.js").PaginatedResult<MatchResponseDTO>>;
  getMatchById(matchId: string): Promise<MatchResponseDTO>;
  createMatch(input: MatchCreateDTO): Promise<MatchResponseDTO>;
  updateMatch(matchId: string, input: MatchUpdateDTO): Promise<MatchResponseDTO>;
  deleteMatch(matchId: string): Promise<void>;
  addGoalToMatch(matchId: string, input: GoalCreateDTO): Promise<MatchResponseDTO>;
  updateMatchGoal(matchId: string, goalId: string, input: GoalUpdateDTO): Promise<MatchResponseDTO>;
  deleteMatchGoal(matchId: string, goalId: string): Promise<MatchResponseDTO>;
}

export interface IMatchController {
  getMatches: import("express").RequestHandler;
  getMatchById: import("express").RequestHandler;
  createMatch: import("express").RequestHandler;
  updateMatch: import("express").RequestHandler;
  deleteMatch: import("express").RequestHandler;
  addGoalToMatch: import("express").RequestHandler;
  updateMatchGoal: import("express").RequestHandler;
  deleteMatchGoal: import("express").RequestHandler;
}
