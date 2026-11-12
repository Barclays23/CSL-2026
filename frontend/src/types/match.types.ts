import type { TeamBrief } from "@/types/team.types";
export type MatchStage = "group" | "quarter_final" | "semi_final" | "final";
export type MatchStatus = "scheduled" | "live" | "completed" | "postponed" | "cancelled";
export type GoalType = "normal" | "own_goal";
export interface PlayerBrief { _id: string; name: string; position: "GK" | "DF" | "MF" | "FW"; jerseyNo: number | null; profilePic: { url: string; publicId: string } | null; teamRef: string | null; }
export interface Goal { _id: string; scoringTeamRef: string | TeamBrief; goalType: GoalType; scorerRef: string | PlayerBrief | null; ownGoalPlayerRef: string | PlayerBrief | null; createdAt: string; }
export interface PenaltyShootout { team1Score: number; team2Score: number; }
export interface Match { _id: string; matchNo: string; stage: MatchStage; groupName: string | null; kickoffAt: string; venue: string | null; team1Ref: string | TeamBrief; team2Ref: string | TeamBrief; status: MatchStatus; goals: Goal[]; penaltyShootout: PenaltyShootout | null; notes: string | null; createdAt: string; updatedAt: string; }
export interface MatchQuery { page?: number; limit?: number; stage?: MatchStage | ""; groupName?: string; status?: MatchStatus | ""; search?: string; }
export interface MatchCreate { matchNo: string; stage: MatchStage; groupName?: string | null; kickoffAt: string; venue?: string | null; team1Ref: string; team2Ref: string; status?: MatchStatus; penaltyShootout?: PenaltyShootout | null; notes?: string | null; }
export type MatchUpdate = Partial<MatchCreate>;
export type MatchWrite = MatchCreate;
export interface GoalWrite { scoringTeamRef: string; goalType: GoalType; scorerRef?: string | null; ownGoalPlayerRef?: string | null; }
