import type { Types } from "mongoose";
import type { TeamBriefDTO } from "../teams/team.types.js";
import type { PlayerPublicDTO } from "../players/player.types.js";
export type MatchStage = "group" | "quarter_final" | "semi_final" | "final";
export type MatchStatus = "scheduled" | "live" | "completed" | "postponed" | "cancelled";
export type GoalType = "normal" | "own_goal";
export interface GoalFields { scoringTeamRef: Types.ObjectId; goalType: GoalType; scorerRef: Types.ObjectId | null; ownGoalPlayerRef: Types.ObjectId | null; }
export interface MatchFields {
  matchNo: string; stage: MatchStage; groupName: string | null; kickoffAt: Date; venue: string | null;
  team1Ref: Types.ObjectId; team2Ref: Types.ObjectId; status: MatchStatus; goals: GoalFields[];
  penaltyShootout: { team1Score: number; team2Score: number } | null; notes: string | null;
}
export interface GoalResponseDTO {
  _id: string; scoringTeamRef: string | TeamBriefDTO; goalType: GoalType;
  scorerRef: string | PlayerPublicDTO | null; ownGoalPlayerRef: string | PlayerPublicDTO | null; createdAt: Date;
}
export interface MatchResponseDTO {
  _id: string; matchNo: string; stage: MatchStage; groupName: string | null; kickoffAt: Date; venue: string | null;
  team1Ref: string | TeamBriefDTO; team2Ref: string | TeamBriefDTO; status: MatchStatus; goals: GoalResponseDTO[];
  penaltyShootout: { team1Score: number; team2Score: number } | null; notes: string | null; createdAt: Date; updatedAt: Date;
}
