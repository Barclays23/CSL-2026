import { USE_MOCK_API } from "@/config/env";
import { previewRepository } from "@/mocks/repository";
import { api, run } from "@/services/api";
import type { ApiResponse } from "@/types/api.types";
import type {
  AdminManager,
  ManagerQuery,
  ManagerResponse,
  ManagerWrite,
} from "@/types/manager.types";

export function getManagers(params: ManagerQuery = {}): Promise<ApiResponse<ManagerResponse[]>> {
  return run<ApiResponse<ManagerResponse[]>>(() =>
    USE_MOCK_API
      ? previewRepository.getManagers(params)
      : api.get<ApiResponse<ManagerResponse[]>>("/managers", { params }).then((response) => response.data),
  );
}

export function getManagerById(id: string): Promise<ApiResponse<ManagerResponse>> {
  return run<ApiResponse<ManagerResponse>>(() =>
    USE_MOCK_API
      ? previewRepository.getManager(id)
      : api.get<ApiResponse<ManagerResponse>>(`/managers/${id}`).then((response) => response.data),
  );
}

export function createManager(data: ManagerWrite): Promise<ApiResponse<AdminManager>> {
  return run<ApiResponse<AdminManager>>(() =>
    USE_MOCK_API
      ? previewRepository.createManager(data)
      : api.post<ApiResponse<AdminManager>>("/managers", data).then((response) => response.data),
  );
}

export function updateManager(id: string, data: ManagerWrite): Promise<ApiResponse<AdminManager>> {
  return run<ApiResponse<AdminManager>>(() =>
    USE_MOCK_API
      ? previewRepository.updateManager(id, data)
      : api.patch<ApiResponse<AdminManager>>(`/managers/${id}`, data).then((response) => response.data),
  );
}

export function deleteManager(id: string): Promise<ApiResponse<null>> {
  return run<ApiResponse<null>>(() =>
    USE_MOCK_API
      ? previewRepository.deleteManager(id)
      : api.delete<ApiResponse<null>>(`/managers/${id}`).then((response) => response.data),
  );
}