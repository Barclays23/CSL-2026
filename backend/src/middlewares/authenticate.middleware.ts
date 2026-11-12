import type { RequestHandler } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env.config.js";
import { UserModel } from "../modules/users/user.model.js";
import { AppError } from "../shared/errors/appError.js";

export const authenticate:RequestHandler=async(req,_res,next)=>{
  const token=req.cookies?.csl_token as string|undefined;
  if(!token){next(new AppError("Authentication required",401,"UNAUTHENTICATED"));return;}
  let payload:jwt.JwtPayload;
  try{
    payload=jwt.verify(token,env.JWT_SECRET) as jwt.JwtPayload;
  }catch{
    next(new AppError("Invalid or expired session",401,"INVALID_TOKEN"));return;
  }
  if(!payload.sub||payload.role!=="admin"){next(new AppError("Invalid administrator token",401,"INVALID_TOKEN"));return;}
  try{
    const user=await UserModel.findById(payload.sub).select("email role status").lean().exec();
    if(!user||user.status!=="active"||user.role!=="admin"){
      next(new AppError("Administrator account is blocked or unavailable",403,"ADMIN_BLOCKED"));return;
    }
    req.user={id:String(user._id),role:"admin",email:user.email};
    next();
  }catch(error){next(error);}
};
