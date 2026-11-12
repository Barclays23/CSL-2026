import { USE_MOCK_API } from "@/config/env";
import { previewRepository } from "@/mocks/repository";
import { api, run } from "@/services/api";
import type { ApiResponse } from "@/types/api.types";
import type { PlayerQuery, PlayerWrite, PublicPlayer } from "@/types/player.types";



export function getPlayers(params: PlayerQuery = {}) {
  return run(() =>
    USE_MOCK_API
      ? previewRepository.getPlayers(params)
      : api.get<ApiResponse<PublicPlayer[]>>("/players", { params }).then((response) => response.data),
  );
}

export function getPlayerById(id: string) {
  return run(() =>
    USE_MOCK_API
      ? previewRepository.getPlayer(id)
      : api.get<ApiResponse<PublicPlayer>>(`/players/${id}`).then((response) => response.data),
  );
}

export function createPlayer(data: PlayerWrite) {
  return run(() =>
    USE_MOCK_API
      ? previewRepository.createPlayer(data)
      : api.post<ApiResponse<PublicPlayer>>("/players", data).then((response) => response.data),
  );
}

export function updatePlayer(id: string, data: PlayerWrite) {
  return run(() =>
    USE_MOCK_API
      ? previewRepository.updatePlayer(id, data)
      : api.patch<ApiResponse<PublicPlayer>>(`/players/${id}`, data).then((response) => response.data),
  );
}

export function deactivatePlayer(id: string) {
  return run(async () => {
    if (USE_MOCK_API) return previewRepository.deactivatePlayer(id);
    const current = await getPlayerById(id);
    return updatePlayer(id, { ...(current.data as PlayerWrite), status: "inactive" });
  });
}

export function deletePlayer(id: string) {
  return run(() =>
    USE_MOCK_API
      ? previewRepository.deletePlayer(id)
      : api.delete<ApiResponse<null>>(`/players/${id}`).then((response) => response.data),
  );
}
