import multer from "multer";
import { env } from "../config/env.config.js";
export const imageUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: env.UPLOAD_MAX_SIZE_MB * 1024 * 1024, files: 1 },
  fileFilter: (_req,file,cb) => {
    if (!["image/jpeg","image/png","image/webp","image/avif"].includes(file.mimetype)) return cb(new Error("Only JPG, PNG, WEBP or AVIF images are allowed"));
    cb(null,true);
  }
});
