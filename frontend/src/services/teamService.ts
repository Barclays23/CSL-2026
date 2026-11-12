import { USE_MOCK_API } from "@/config/env";
import { previewRepository } from "@/mocks/repository";
import { api, run } from "@/services/api";
import type { ApiResponse } from "@/types/api.types";
import type { TeamStatistics } from "@/types/statistics.types";
import type { AuctionSummary, Team, TeamCreate, TeamUpdate } from "@/types/team.types";
export function getTeams() { return run(() => USE_MOCK_API ? previewRepository.getTeams() : api.get<ApiResponse<Team[]>>("/teams").then((response) => response.data)); }
export function getTeamById(id: string) { return run(() => USE_MOCK_API ? previewRepository.getTeam(id) : api.get<ApiResponse<Team>>(`/teams/${id}`).then((response) => response.data)); }
export function getAuctionSummary() { return run(() => USE_MOCK_API ? previewRepository.getAuctionSummary() : api.get<ApiResponse<AuctionSummary>>("/teams/auction-summary").then((response) => response.data)); }
export function createTeam(data: TeamCreate) { return run(() => USE_MOCK_API ? previewRepository.createTeam(data) : api.post<ApiResponse<Team>>("/teams", data).then((response) => response.data)); }
export function updateTeam(id: string, data: TeamUpdate) { return run(() => USE_MOCK_API ? previewRepository.updateTeam(id, data) : api.patch<ApiResponse<Team>>(`/teams/${id}`, data).then((response) => response.data)); }
export function deleteTeam(id: string) { return run(() => USE_MOCK_API ? previewRepository.deleteTeam(id) : api.delete<ApiResponse<null>>(`/teams/${id}`).then((response) => response.data)); }
export function getTeamStatistics(id: string) { return run(() => USE_MOCK_API ? previewRepository.getTeamStatistics(id) : api.get<ApiResponse<TeamStatistics>>(`/teams/${id}/statistics`).then((response) => response.data)); }
