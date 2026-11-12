import { USE_MOCK_API } from "@/config/env";
import { previewRepository } from "@/mocks/repository";
import { api, run } from "@/services/api";
import type { ApiResponse } from "@/types/api.types";
import type { Settings, SettingsUpdate } from "@/types/settings.types";

export function getSettings() {
  return run(() =>
    USE_MOCK_API
      ? previewRepository.getSettings()
      : api.get<ApiResponse<Settings>>("/settings").then((response) => response.data),
  );
}

export function updateSettings(data: SettingsUpdate) {
  return run(() =>
    USE_MOCK_API
      ? previewRepository.updateSettings(data)
      : api.patch<ApiResponse<Settings>>("/settings", data).then((response) => response.data),
  );
}

export function resetPreviewData() {
  if (!USE_MOCK_API) {
    return Promise.reject(new Error("Sample data can only be reset while preview mode is on."));
  }
  return run(() => previewRepository.reset());
}
