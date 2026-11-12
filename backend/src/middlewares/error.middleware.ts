import type { ErrorRequestHandler } from "express";
import mongoose from "mongoose";
import multer from "multer";
import { ZodError } from "zod";
import { AppError } from "../shared/errors/appError.js";
export const errorMiddleware:ErrorRequestHandler=(error:unknown,_req,res,_next)=>{
  if(error instanceof AppError){res.status(error.statusCode).json({success:false,message:error.message,errorCode:error.errorCode,...(error.fieldErrors?{fieldErrors:error.fieldErrors}:{})});return;}
  if(error instanceof ZodError){
    const fieldErrors:Record<string,string>={};for(const issue of error.issues){const key=issue.path.join(".");if(key&&!fieldErrors[key])fieldErrors[key]=issue.message;}
    res.status(400).json({success:false,message:"Validation failed",errorCode:"VALIDATION_ERROR",fieldErrors});return;
  }
  if(error instanceof multer.MulterError){
    const tooLarge=error.code==="LIMIT_FILE_SIZE";
    res.status(tooLarge?413:400).json({success:false,message:tooLarge?"Image exceeds the upload size limit":error.message,errorCode:error.code});return;
  }
  if(error instanceof mongoose.Error.ValidationError){
    const fieldErrors=Object.fromEntries(Object.entries(error.errors).map(([k,v])=>[k,v.message]));
    res.status(400).json({success:false,message:"Database validation failed",errorCode:"VALIDATION_ERROR",fieldErrors});return;
  }
  if(error instanceof mongoose.Error.CastError){res.status(400).json({success:false,message:"Invalid identifier or value",errorCode:"INVALID_VALUE"});return;}
  if(typeof error==="object"&&error&&"code"in error&&error.code===11000){res.status(409).json({success:false,message:"A record with this value already exists",errorCode:"DUPLICATE_VALUE"});return;}
  if(error instanceof Error&&["Only JPG, PNG, WEBP or AVIF images are allowed"].includes(error.message)){res.status(400).json({success:false,message:error.message,errorCode:"INVALID_IMAGE"});return;}
  console.error("[API_ERROR]",error);
  res.status(500).json({success:false,message:"An unexpected server error occurred",errorCode:"INTERNAL_SERVER_ERROR"});
};
