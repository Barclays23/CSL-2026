import type { Types } from "mongoose";
import type { Asset } from "../../shared/types/common.types.js";
import type { MatchCreateInput, MatchQueryInput, MatchUpdateInput, GoalInput } from "./match.dto.js";
import type { TeamBriefDTO } from "../teams/team.types.js";

export interface IMatchRepository {
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
  getMatches: import("../../shared/types/common.types.js").ControllerMethod;
  getMatchById: import("../../shared/types/common.types.js").ControllerMethod;
  createMatch: import("../../shared/types/common.types.js").ControllerMethod;
  updateMatch: import("../../shared/types/common.types.js").ControllerMethod;
  deleteMatch: import("../../shared/types/common.types.js").ControllerMethod;
  addGoalToMatch: import("../../shared/types/common.types.js").ControllerMethod;
  updateMatchGoal: import("../../shared/types/common.types.js").ControllerMethod;
  deleteMatchGoal: import("../../shared/types/common.types.js").ControllerMethod;
}
