import type { ImageUploadFile, ImageUploadResult } from "./upload.types.js";
import type { UploadPurpose } from "./upload.dto.js";

export interface IUploadService {
  uploadImage(file: ImageUploadFile, purpose: UploadPurpose): Promise<ImageUploadResult>;
  deleteUploadedImage(publicId: string): Promise<void>;
}

export interface IUploadController {
  uploadImage: import("../../shared/types/common.types.js").ControllerMethod;
}
