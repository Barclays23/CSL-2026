import type { RequestHandler } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env.config.js";
import { AppError } from "../shared/errors/appError.js";
export const authenticate: RequestHandler = (req,_res,next) => {
  const token=req.cookies?.csl_token as string|undefined;
  if(!token)return next(new AppError("Authentication required",401,"UNAUTHENTICATED"));
  try{
    const payload=jwt.verify(token,env.JWT_SECRET) as jwt.JwtPayload;
    if(!payload.sub||payload.role!=="admin")throw new Error("Invalid token");
    req.user={id:String(payload.sub),role:"admin",email:String(payload.email??"")};
    next();
  }catch{next(new AppError("Invalid or expired session",401,"INVALID_TOKEN"));}
};
