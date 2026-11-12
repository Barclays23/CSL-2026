import multer, { type Multer } from "multer";
import { env } from "../config/env.config.js";

const supportedImageMimeTypes: readonly string[] = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
];

export const imageUpload: Multer = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: env.UPLOAD_MAX_SIZE_MB * 1024 * 1024,
    files: 1,
  },
  fileFilter: (_request, file, callback): void => {
    if (!supportedImageMimeTypes.includes(file.mimetype)) {
      callback(new Error("Only JPG, PNG, WEBP or AVIF images are allowed"));
      return;
    }
    callback(null, true);
  },
});
