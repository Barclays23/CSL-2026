import { USE_MOCK_API } from "@/config/env";
import { previewRepository } from "@/mocks/repository";
import { api, run } from "@/services/api";
import type { ApiResponse } from "@/types/api.types";
import type { AdminSponsor, SponsorQuery, SponsorResponse, SponsorWrite } from "@/types/sponsor.types";

export function getSponsors(params: SponsorQuery = {}) {
  return run(() =>
    USE_MOCK_API
      ? previewRepository.getSponsors(params)
      : api.get<ApiResponse<SponsorResponse[]>>("/sponsors", { params }).then((response) => response.data),
  );
}

export function createSponsor(data: SponsorWrite): Promise<ApiResponse<AdminSponsor>> {
  return run<ApiResponse<AdminSponsor>>(() =>
    USE_MOCK_API
      ? previewRepository.createSponsor(data)
      : api.post<ApiResponse<AdminSponsor>>("/sponsors", data).then((response) => response.data),
  );
}

export function updateSponsor(id: string, data: SponsorWrite): Promise<ApiResponse<AdminSponsor>> {
  return run<ApiResponse<AdminSponsor>>(() =>
    USE_MOCK_API
      ? previewRepository.updateSponsor(id, data)
      : api.patch<ApiResponse<AdminSponsor>>(`/sponsors/${id}`, data).then((response) => response.data),
  );
}

export function deleteSponsor(id: string) {
  return run(() =>
    USE_MOCK_API
      ? previewRepository.deleteSponsor(id)
      : api.delete<ApiResponse<null>>(`/sponsors/${id}`).then((response) => response.data),
  );
}