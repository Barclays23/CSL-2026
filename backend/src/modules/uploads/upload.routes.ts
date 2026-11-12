import { Router } from "express";
import { authenticate } from "../../middlewares/authenticate.middleware.js";
import { requireAdmin } from "../../middlewares/authorizeAdmin.middleware.js";
import { imageUpload } from "../../middlewares/upload.middleware.js";
import { uploadLimiter } from "../../middlewares/rateLimit.middleware.js";
import { validate } from "../../middlewares/validate.middleware.js";
import { uploadController } from "../../container/dependencies.js";
import { imageUploadSchema } from "./upload.schema.js";




export const uploadRouter = Router();




uploadRouter.post(
  "/",
  uploadLimiter,
  authenticate,
  requireAdmin,
  imageUpload.single("file"),
  validate(imageUploadSchema),
  uploadController.uploadImage,
);
