import { UPLOAD_PATH, USE_MOCK_API } from "@/config/env";
import { api, run } from "@/services/api";
import { validatePhotoFile } from "@/schemas/common.schema";
import type { ApiResponse, Asset } from "@/types/api.types";
import { ApiError } from "@/utils/errorHandler";

export type UploadPurpose =
  | "player-profile"
  | "team-logo"
  | "team-poster"
  | "manager-profile"
  | "sponsor-logo";



export function uploadImage(file: File, purpose: UploadPurpose) {
  return run(async () => {
    const problem = validatePhotoFile(file);
    if (problem) throw new ApiError(400, problem, { fieldErrors: { photo: problem } });

    if (USE_MOCK_API) {
      const url = await readFile(file);
      return {
        success: true as const,
        message: "Image stored in the preview",
        data: { url, publicId: `${purpose}-${crypto.randomUUID()}` } satisfies Asset,
      };
    }

    const body = new FormData();
    body.append("file", file);
    body.append("purpose", purpose);
    
    const response = await api.post<ApiResponse<Asset>>(UPLOAD_PATH, body);
    return response.data;
  });
}

function readFile(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new ApiError(400, "Could not read that image"));
    reader.readAsDataURL(file);
  });
}
