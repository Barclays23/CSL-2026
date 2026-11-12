import { USE_MOCK_API } from "@/config/env";
import { previewRepository } from "@/mocks/repository";
import { api, run } from "@/services/api";
import type { ApiResponse } from "@/types/api.types";
import type { DashboardSummary, GroupStanding, TeamStatistics, TopScorer } from "@/types/statistics.types";

export function getDashboardSummary() {
  return run(() =>
    USE_MOCK_API
      ? previewRepository.getDashboard()
      : api.get<ApiResponse<DashboardSummary>>("/dashboard/summary").then((response) => response.data),
  );
}

export function getStandings() {
  return run(() =>
    USE_MOCK_API
      ? previewRepository.getStandings()
      : api.get<ApiResponse<GroupStanding[]>>("/standings").then((response) => response.data),
  );
}

export function getTopScorers() {
  return run(() =>
    USE_MOCK_API
      ? previewRepository.getTopScorers()
      : api.get<ApiResponse<TopScorer[]>>("/top-scorers").then((response) => response.data),
  );
}

export function getTeamStatistics(teamId: string) {
  return run(() =>
    USE_MOCK_API
      ? previewRepository.getTeamStatistics(teamId)
      : api.get<ApiResponse<TeamStatistics>>(`/teams/${teamId}/statistics`).then((response) => response.data),
  );
}
