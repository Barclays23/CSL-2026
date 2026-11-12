import { USE_MOCK_API } from "@/config/env";
import { previewRepository } from "@/mocks/repository";
import { api, run } from "@/services/api";
import type { ApiResponse } from "@/types/api.types";
import type { GoalWrite, Match, MatchQuery, MatchWrite } from "@/types/match.types";

export function getMatches(params: MatchQuery = {}) {
  return run(() =>
    USE_MOCK_API
      ? previewRepository.getMatches(params)
      : api.get<ApiResponse<Match[]>>("/matches", { params }).then((response) => response.data),
  );
}

export function getMatchById(id: string) {
  return run(() =>
    USE_MOCK_API
      ? previewRepository.getMatch(id)
      : api.get<ApiResponse<Match>>(`/matches/${id}`).then((response) => response.data),
  );
}

export function createMatch(data: MatchWrite) {
  return run(() =>
    USE_MOCK_API
      ? previewRepository.createMatch(data)
      : api.post<ApiResponse<Match>>("/matches", data).then((response) => response.data),
  );
}

export function updateMatch(id: string, data: MatchWrite) {
  return run(() =>
    USE_MOCK_API
      ? previewRepository.updateMatch(id, data)
      : api.patch<ApiResponse<Match>>(`/matches/${id}`, data).then((response) => response.data),
  );
}

export function deleteMatch(id: string) {
  return run(() =>
    USE_MOCK_API
      ? previewRepository.deleteMatch(id)
      : api.delete<ApiResponse<null>>(`/matches/${id}`).then((response) => response.data),
  );
}

export function addGoal(matchId: string, data: GoalWrite) {
  return run(() =>
    USE_MOCK_API
      ? previewRepository.addGoal(matchId, data)
      : api.post<ApiResponse<Match>>(`/matches/${matchId}/goals`, data).then((response) => response.data),
  );
}

export function updateGoal(matchId: string, goalId: string, data: GoalWrite) {
  return run(() =>
    USE_MOCK_API
      ? previewRepository.updateGoal(matchId, goalId, data)
      : api.patch<ApiResponse<Match>>(`/matches/${matchId}/goals/${goalId}`, data).then((response) => response.data),
  );
}

export function deleteGoal(matchId: string, goalId: string) {
  return run(() =>
    USE_MOCK_API
      ? previewRepository.deleteGoal(matchId, goalId)
      : api.delete<ApiResponse<Match>>(`/matches/${matchId}/goals/${goalId}`).then((response) => response.data),
  );
}
