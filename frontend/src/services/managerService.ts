import { USE_MOCK_API } from "@/config/env";
import { previewRepository } from "@/mocks/repository";
import { api, run } from "@/services/api";
import type { ApiResponse } from "@/types/api.types";
import type { AdminManager, ManagerQuery, ManagerWrite, PublicManager } from "@/types/manager.types";

export function getManagers(params: ManagerQuery = {}) {
  return run(() =>
    USE_MOCK_API
      ? previewRepository.getManagers(params)
      : api.get<ApiResponse<PublicManager[]>>("/managers", { params }).then((response) => response.data),
  );
}

export function getManagerById(id: string) {
  return run(() =>
    USE_MOCK_API
      ? previewRepository.getManager(id)
      : api.get<ApiResponse<PublicManager>>(`/managers/${id}`).then((response) => response.data),
  );
}

export function createManager(data: ManagerWrite) {
  return run(() =>
    USE_MOCK_API
      ? previewRepository.createManager(data)
      : api.post<ApiResponse<AdminManager>>("/managers", data).then((response) => response.data),
  );
}

export function updateManager(id: string, data: ManagerWrite) {
  return run(() =>
    USE_MOCK_API
      ? previewRepository.updateManager(id, data)
      : api.patch<ApiResponse<AdminManager>>(`/managers/${id}`, data).then((response) => response.data),
  );
}

export function deleteManager(id: string) {
  return run(() =>
    USE_MOCK_API
      ? previewRepository.deleteManager(id)
      : api.delete<ApiResponse<null>>(`/managers/${id}`).then((response) => response.data),
  );
}
