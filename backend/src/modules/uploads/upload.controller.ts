import type { RequestHandler } from "express";
import { asyncHandler } from "../../shared/utils/asyncHandler.js";
import { sendSuccess } from "../../shared/responses/response.helper.js";
import { AppError } from "../../shared/errors/appError.js";
import type { IUploadController, IUploadService } from "./upload.types.js";
import { imageUploadSchema } from "./upload.dto.js";

export class UploadController implements IUploadController {
  constructor(private readonly uploadService: IUploadService) {}

  uploadImage: RequestHandler = asyncHandler(async (request, response) => {
    if (!request.file) throw new AppError("An image file is required", 400, "FILE_REQUIRED");
    const { purpose } = imageUploadSchema.parse(request.body);
    const uploadedAsset = await this.uploadService.uploadImage({
      buffer: request.file.buffer,
      mimetype: request.file.mimetype,
      size: request.file.size,
    }, purpose);
    sendSuccess(response, uploadedAsset, "Image uploaded successfully", 201);
  });
}
