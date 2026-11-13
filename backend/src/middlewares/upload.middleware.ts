import multer, { type Multer } from "multer";
import {
  FILE_UPLOAD_MESSAGES,
  IMAGE_UPLOAD_LIMITS,
  SUPPORTED_IMAGE_MIME_TYPES,
  type SupportedImageMimeType,
} from "../shared/constants/file.constants.js";




export const imageUpload: Multer = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: IMAGE_UPLOAD_LIMITS.MAX_SIZE_BYTES,
    files: IMAGE_UPLOAD_LIMITS.MAX_FILES,
  },
  fileFilter: (_request, file, callback): void => {
    if (!SUPPORTED_IMAGE_MIME_TYPES.includes(file.mimetype as SupportedImageMimeType)) {
      callback(new Error(FILE_UPLOAD_MESSAGES.INVALID_IMAGE_TYPE));
      return;
    }
    callback(null, true);
  },
});
