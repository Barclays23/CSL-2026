import { USE_MOCK_API } from "@/config/env";
import { previewRepository } from "@/mocks/repository";
import { api, run } from "@/services/api";
import type { ApiResponse, Pagination } from "@/types/api.types";
import type { AdminPlayer, PlayerCreate, PlayerQuery, PlayerUpdate, PublicPlayer, AssignPlayer } from "@/types/player.types";
export interface PaginatedPlayers { data: Array<PublicPlayer | AdminPlayer>; pagination?: Pagination; }
export function getPlayers(params: PlayerQuery = {}) {
  return run(() => USE_MOCK_API ? previewRepository.getPlayers(params) : api.get<ApiResponse<Array<PublicPlayer | AdminPlayer>>>("/players", { params }).then((response) => response.data));
}
export function getPlayerById(id: string) {
  return run(() => USE_MOCK_API ? previewRepository.getPlayer(id) : api.get<ApiResponse<PublicPlayer | AdminPlayer>>(`/players/${id}`).then((response) => response.data));
}
export function createPlayer(data: PlayerCreate) {
  return run(() => USE_MOCK_API ? previewRepository.createPlayer(data) : api.post<ApiResponse<PublicPlayer | AdminPlayer>>("/players", data).then((response) => response.data));
}
export function updatePlayer(id: string, data: PlayerUpdate) {
  return run(() => USE_MOCK_API ? previewRepository.updatePlayer(id, data) : api.patch<ApiResponse<PublicPlayer | AdminPlayer>>(`/players/${id}`, data).then((response) => response.data));
}
export function deactivatePlayer(id: string) {
  return run(() => USE_MOCK_API ? previewRepository.deactivatePlayer(id) : api.patch<ApiResponse<AdminPlayer>>(`/players/${id}/deactivate`).then((response) => response.data));
}
export function assignPlayerToTeam(id: string, data: AssignPlayer) {
  return run(() => api.patch<ApiResponse<AdminPlayer>>(`/players/${id}/assign`, data).then((response) => response.data));
}
export function markPlayerUnsold(id: string) {
  return run(() => api.patch<ApiResponse<AdminPlayer>>(`/players/${id}/unsold`).then((response) => response.data));
}
export function deletePlayer(id: string) {
  return run(() => USE_MOCK_API ? previewRepository.deletePlayer(id) : api.delete<ApiResponse<null>>(`/players/${id}`).then((response) => response.data));
}
