import type { Asset } from "../../shared/types/common.types.js";

export interface ImageUploadFile {
  buffer: Buffer;
  mimetype: string;
  size: number;
}

export interface ImageUploadResult extends Asset {}
export type { IUploadService, IUploadController } from "./upload.interfaces.js";
