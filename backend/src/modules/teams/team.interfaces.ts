import type { TeamEntity, TeamDTO, TeamCreateDTO, TeamUpdateDTO, TeamQueryDTO, TeamListFilter, TeamReferenceCounts, TeamAuctionSummaryDTO } from "./team.types.js";
import type { Types } from "mongoose";
import type { Asset, ControllerMethod } from "../../shared/types/common.types.js";
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
  getTeams: ControllerMethod;
  getTeamById: ControllerMethod;
  getTeamAuctionSummary: ControllerMethod;
  getTeamStatistics: ControllerMethod;
  createTeam: ControllerMethod;
  updateTeam: ControllerMethod;
  deleteTeam: ControllerMethod;
}
