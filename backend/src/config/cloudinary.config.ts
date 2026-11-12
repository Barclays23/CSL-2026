import { v2 as cloudinary } from "cloudinary";
import { env } from "./env.config.js";

const hasCloudinaryCredentials: boolean = Boolean(
  env.CLOUDINARY_CLOUD_NAME &&
  env.CLOUDINARY_API_KEY &&
  env.CLOUDINARY_API_SECRET,
);

if (hasCloudinaryCredentials) {
  cloudinary.config({
    cloud_name: env.CLOUDINARY_CLOUD_NAME,
    api_key: env.CLOUDINARY_API_KEY,
    api_secret: env.CLOUDINARY_API_SECRET,
    secure: true,
  });
}

export { cloudinary };
export const cloudinaryReady: boolean = hasCloudinaryCredentials;
