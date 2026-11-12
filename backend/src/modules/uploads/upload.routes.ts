import { Router } from "express";
import { authenticate } from "../../middlewares/authenticate.middleware.js";
import { requireAdmin } from "../../middlewares/authorizeAdmin.middleware.js";
import { imageUpload } from "../../middlewares/upload.middleware.js";
import { uploadLimiter } from "../../middlewares/rateLimit.middleware.js";
import { controllers } from "../../container/index.js";
export const uploadRouter=Router();
uploadRouter.post("/",uploadLimiter,authenticate,requireAdmin,imageUpload.single("file"),controllers.upload.upload);
