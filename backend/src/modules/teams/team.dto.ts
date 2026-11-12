import type { Asset } from "../../shared/types/common.types.js";
import type { TeamStatus } from "./team.types.js";

export interface CreateTeamDto {
  name: string;
  shortName?: string | null;
  logo?: Asset | null;
  poster?: Asset | null;
  groupName?: string | null;
  status?: TeamStatus;
}
export type UpdateTeamDto = Partial<CreateTeamDto>;
export interface TeamQueryDto {
  page: number;
  limit: number;
  search?: string;
  status?: TeamStatus;
  groupName?: string;
}
export type TeamCreateInput = CreateTeamDto;
export type TeamUpdateInput = UpdateTeamDto;
export type TeamQueryInput = TeamQueryDto;
export type TeamCreateDTO = CreateTeamDto;
export type TeamUpdateDTO = UpdateTeamDto;
export type TeamQueryDTO = TeamQueryDto;
