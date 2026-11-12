import type { RequestHandler } from "express";
import { asyncHandler } from "../../shared/utils/asyncHandler.js";
import { sendSuccess } from "../../shared/responses/response.helper.js";
import { AppError } from "../../shared/errors/appError.js";
import { UploadService } from "./upload.service.js";
export class UploadController {
  constructor(private readonly service:UploadService){}
  upload:RequestHandler=asyncHandler(async(req,res)=>{
    if(!req.file)throw new AppError("An image file is required",400,"FILE_REQUIRED");
    const asset=await this.service.upload(req.file.buffer,req.file.mimetype,String(req.body.purpose||""));
    sendSuccess(res,asset,"Image uploaded successfully",201);
  });
}
