import { cloudinary, cloudinaryReady } from "../../config/cloudinary.config.js";
import { AppError } from "../../shared/errors/appError.js";
import type { ImageUploadResult, ImageUploadFile, IUploadService } from "./upload.types.js";
import type { UploadPurpose } from "./upload.dto.js";
import { appConfig } from "../../config/env.config.js";



const uploadFolderByPurpose: Record<UploadPurpose, string> = {
  // eg: "purpose" : "cloudinary folder"
  "user-profile": `${appConfig.CLOUDINARY_FOLDER}/users`,
  "player-profile": `${appConfig.CLOUDINARY_FOLDER}/players`,
  "team-logo": `${appConfig.CLOUDINARY_FOLDER}/teams/logos`,
  "team-poster": `${appConfig.CLOUDINARY_FOLDER}/teams/posters`,
  "manager-profile": `${appConfig.CLOUDINARY_FOLDER}/managers`,
  "sponsor-logo": `${appConfig.CLOUDINARY_FOLDER}/sponsors`,
};

const supportedImageMimeTypes = ["image/jpeg", "image/png", "image/webp", "image/avif"];

interface CloudinaryUploadResult {
  secure_url: string;
  public_id: string;
}

export class UploadService implements IUploadService {
  async uploadImage(file: ImageUploadFile, purpose: UploadPurpose): Promise<ImageUploadResult> {
    if (!cloudinaryReady) {
      throw new AppError("Cloudinary is not configured", 503, "UPLOAD_NOT_CONFIGURED");
    }
    if (!supportedImageMimeTypes.includes(file.mimetype)) {
      throw new AppError("Unsupported image type", 400, "INVALID_IMAGE");
    }

    const folder = uploadFolderByPurpose[purpose];
    const result = await new Promise<CloudinaryUploadResult>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { folder, resource_type: "image" },
        (error, uploadResult) => {
          if (error || !uploadResult) {
            reject(error ?? new Error("Cloudinary image upload returned no result"));
            return;
          }
          resolve({
            secure_url: uploadResult.secure_url,
            public_id: uploadResult.public_id,
          });
        },
      );
      uploadStream.end(file.buffer);
    });

    return {
      url: result.secure_url,
      publicId: result.public_id,
    };
  }

  async deleteUploadedImage(publicId: string): Promise<void> {
    if (!cloudinaryReady) {
      throw new AppError("Cloudinary is not configured", 503, "UPLOAD_NOT_CONFIGURED");
    }

    const result = await cloudinary.uploader.destroy(publicId, { resource_type: "image" });
    if (result.result !== "ok" && result.result !== "not found") {
      throw new AppError("Cloudinary image could not be deleted", 502, "IMAGE_DELETE_FAILED");
    }
  }
}
