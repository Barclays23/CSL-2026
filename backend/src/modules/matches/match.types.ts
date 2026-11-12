import type { Types } from "mongoose";
export type MatchStage="group"|"quarter_final"|"semi_final"|"final";
export type MatchStatus="scheduled"|"live"|"completed"|"postponed"|"cancelled";
export type GoalType="normal"|"own_goal";
export interface GoalFields {
  scoringTeamRef:Types.ObjectId;goalType:GoalType;scorerRef:Types.ObjectId|null;ownGoalPlayerRef:Types.ObjectId|null;
}
export interface MatchFields {
  matchNo:string;stage:MatchStage;groupName:string|null;kickoffAt:Date;venue:string|null;
  team1Ref:Types.ObjectId;team2Ref:Types.ObjectId;status:MatchStatus;goals:GoalFields[];
  penaltyShootout:{team1Score:number;team2Score:number}|null;notes:string|null;
}
