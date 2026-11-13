import { USE_MOCK_API } from "@/config/env";
import { previewRepository } from "@/mocks/repository";
import { api, run } from "@/services/api";
import type { ApiResponse } from "@/types/api.types";
import type { AdminUser } from "@/types/auth.types";




export function login(identifier: string, password: string): Promise<ApiResponse<AdminUser>> {
  return run(() =>
    USE_MOCK_API
      ? previewRepository.login(identifier, password)
      : api
          .post<ApiResponse<AdminUser>>("/auth/login", { identifier, password })
          .then((response) => response.data)
  );
}

export function logout() {
  return run(() =>
    USE_MOCK_API
      ? previewRepository.logout()
      : api.post<ApiResponse<null>>("/auth/logout").then((response) => response.data),
  );
}

export function getCurrentUser() {
  return run(() =>
    USE_MOCK_API
      ? previewRepository.me()
      : api.get<ApiResponse<AdminUser | null>>("/auth/me").then((response) => response.data),
  );
}
