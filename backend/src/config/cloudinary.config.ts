import { v2 as cloudinary } from "cloudinary";
import { appConfig } from "./env.config.js";

const hasCloudinaryCredentials: boolean = Boolean(
  appConfig.CLOUDINARY_CLOUD_NAME &&
  appConfig.CLOUDINARY_API_KEY &&
  appConfig.CLOUDINARY_API_SECRET,
);

if (hasCloudinaryCredentials) {
  cloudinary.config({
    cloud_name: appConfig.CLOUDINARY_CLOUD_NAME,
    api_key: appConfig.CLOUDINARY_API_KEY,
    api_secret: appConfig.CLOUDINARY_API_SECRET,
    secure: true,
  });
}

export { cloudinary };
export const cloudinaryReady: boolean = hasCloudinaryCredentials;
