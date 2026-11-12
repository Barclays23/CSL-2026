import { cloudinary,cloudinaryReady } from "../../config/cloudinary.config.js";
import { AppError } from "../../shared/errors/appError.js";
import type { Asset } from "../../shared/types/common.types.js";
export class UploadService {
  async upload(buffer:Buffer,mimetype:string,purpose:string):Promise<Asset>{
    if(!cloudinaryReady)throw new AppError("Cloudinary is not configured",503,"UPLOAD_NOT_CONFIGURED");
    const folders:Record<string,string>={"player-profile":"players","team-logo":"teams/logos","team-poster":"teams/posters","manager-profile":"managers","sponsor-logo":"sponsors"};
    const folder=folders[purpose];if(!folder)throw new AppError("Invalid upload purpose",400,"INVALID_UPLOAD_PURPOSE");
    if(!["image/jpeg","image/png","image/webp","image/avif"].includes(mimetype))throw new AppError("Unsupported image type",400,"INVALID_IMAGE");
    const result=await new Promise<{secure_url:string;public_id:string}>((resolve,reject)=>{
      const stream=cloudinary.uploader.upload_stream({folder,resource_type:"image"},(error,result)=>{if(error||!result)return reject(error??new Error("Upload failed"));resolve({secure_url:result.secure_url,public_id:result.public_id});});
      stream.end(buffer);
    });
    return {url:result.secure_url,publicId:result.public_id};
  }
  async remove(publicId:string){if(!cloudinaryReady)throw new AppError("Cloudinary is not configured",503,"UPLOAD_NOT_CONFIGURED");return cloudinary.uploader.destroy(publicId);}
}
