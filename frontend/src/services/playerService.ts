import { USE_MOCK_API } from "@/config/env";
import { previewRepository } from "@/mocks/repository";
import { api, run } from "@/services/api";
import type { ApiResponse } from "@/types/api.types";
import type { AdminPlayer, PlayerQuery, PlayerWrite, PublicPlayer } from "@/types/player.types";

export function getPlayers(params: PlayerQuery = {}) {
  return run(() =>
    USE_MOCK_API
      ? previewRepository.getPlayers(params)
      : api
          .get<ApiResponse<(PublicPlayer | AdminPlayer)[]>>("/players", { params })
          .then((response) => response.data),
  );
}

export function getPlayerById(id: string) {
  return run(() =>
    USE_MOCK_API
      ? previewRepository.getPlayer(id)
      : api.get<ApiResponse<PublicPlayer | AdminPlayer>>(`/players/${id}`).then((response) => response.data),
  );
}

export function createPlayer(data: PlayerWrite) {
  return run(() =>
    USE_MOCK_API
      ? previewRepository.createPlayer(data)
      : api.post<ApiResponse<AdminPlayer>>("/players", data).then((response) => response.data),
  );
}

export function updatePlayer(id: string, data: PlayerWrite) {
  return run(() =>
    USE_MOCK_API
      ? previewRepository.updatePlayer(id, data)
      : api.patch<ApiResponse<AdminPlayer>>(`/players/${id}`, data).then((response) => response.data),
  );
}

/**
 * The backend must handle status=inactive as one service operation:
 * clear teamRef/jerseyNo, zero auctionPrice, and reset auctionStatus=pending.
 */
export function deactivatePlayer(id: string) {
  return run(() =>
    USE_MOCK_API
      ? previewRepository.deactivatePlayer(id)
      : api
          .patch<ApiResponse<PublicPlayer | AdminPlayer>>(`/players/${id}`, { status: "inactive" })
          .then((response) => response.data),
  );
}

export function deletePlayer(id: string) {
  return run(() =>
    USE_MOCK_API
      ? previewRepository.deletePlayer(id)
      : api.delete<ApiResponse<null>>(`/players/${id}`).then((response) => response.data),
  );
}
