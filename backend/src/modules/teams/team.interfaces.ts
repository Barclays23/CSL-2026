import type { Types } from "mongoose";
import type { Asset } from "../../shared/types/common.types.js";
import type { PlayerPublicDTO } from "../players/player.types.js";
import type { TeamCreateInput, TeamQueryInput, TeamUpdateInput } from "./team.dto.js";

export interface ITeamRepository {
  findTeams(filter: TeamListFilter, page: number, limit: number): Promise<{ items: TeamEntity[]; total: number }>;
  findTeamById(teamId: string): Promise<TeamEntity | null>;
  findTeamByName(name: string): Promise<TeamEntity | null>;
  countActiveTeams(): Promise<number>;
  findTeamReferenceCounts(teamId: string): Promise<TeamReferenceCounts>;
  createTeam(data: TeamCreateDTO): Promise<TeamEntity>;
  updateTeam(teamId: string, data: TeamUpdateDTO): Promise<TeamEntity | null>;
  deleteTeam(teamId: string): Promise<boolean>;
}
export interface ITeamService {
  getTeams(query: TeamQueryDTO, isAdmin: boolean): Promise<import("../../shared/types/common.types.js").PaginatedResult<TeamDTO>>;
  getTeamById(teamId: string): Promise<TeamDTO>;
  createTeam(input: TeamCreateDTO): Promise<TeamDTO>;
  updateTeam(teamId: string, input: TeamUpdateDTO): Promise<TeamDTO>;
  deleteTeam(teamId: string): Promise<void>;
  getTeamAuctionSummary(): Promise<TeamAuctionSummaryDTO>;
}
export interface ITeamController {
  getTeams: import("../../shared/types/common.types.js").ControllerMethod;
  getTeamById: import("../../shared/types/common.types.js").ControllerMethod;
  getTeamAuctionSummary: import("../../shared/types/common.types.js").ControllerMethod;
  getTeamStatistics: import("../../shared/types/common.types.js").ControllerMethod;
  createTeam: import("../../shared/types/common.types.js").ControllerMethod;
  updateTeam: import("../../shared/types/common.types.js").ControllerMethod;
  deleteTeam: import("../../shared/types/common.types.js").ControllerMethod;
}
