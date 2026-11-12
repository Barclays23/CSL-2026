import type { Asset } from "../../shared/types/common.types.js";
import type { UploadPurpose } from "./upload.dto.js";

export interface ImageUploadFile {
  buffer: Buffer;
  mimetype: string;
  size: number;
}

export interface ImageUploadResult extends Asset {}

export interface IUploadService {
  uploadImage(file: ImageUploadFile, purpose: UploadPurpose): Promise<ImageUploadResult>;
  deleteUploadedImage(publicId: string): Promise<void>;
}

export interface IUploadController {
  uploadImage: import("../../shared/types/common.types.js").ControllerMethod;
}
