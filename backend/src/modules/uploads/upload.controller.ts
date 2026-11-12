import type { Request, Response, NextFunction } from "express";
import { ApiResponse } from "../../utils/apiResponse.utils.js";
import { HTTP_STATUS } from "../../shared/constants/http-status.constants.js";
import { UPLOAD_MESSAGES } from "../../shared/constants/messages.constants.js";
import { AppError } from "../../shared/errors/appError.js";
import type { IUploadController, IUploadService } from "./upload.interfaces.js";
import type { ImageUploadResult, ImageUploadFile } from "./upload.types.js";
import { imageUploadSchema, type UploadPurpose } from "./upload.dto.js";





export class UploadController implements IUploadController {
  constructor(
    private readonly _uploadService: IUploadService
  ) {}

  uploadImage = async (
    request: Request,
    response: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      if (!request.file) {
        throw new AppError(
          "An image file is required",
          HTTP_STATUS.BAD_REQUEST,
          "FILE_REQUIRED",
        );
      }
      const purposeInput: { purpose: UploadPurpose } = imageUploadSchema.parse(
        request.body,
      );
      const uploadFile: ImageUploadFile = {
        buffer: request.file.buffer,
        mimetype: request.file.mimetype,
        size: request.file.size,
      };
      const uploadedAsset: ImageUploadResult =
        await this._uploadService.uploadImage(
          uploadFile,
          purposeInput.purpose,
        );
      response
        .status(HTTP_STATUS.CREATED)
        .json(
          ApiResponse.success<ImageUploadResult>(
            UPLOAD_MESSAGES.IMAGE_UPLOADED,
            uploadedAsset,
          ),
        );
    } catch (error: unknown) {
      next(error);
    }
  };
}