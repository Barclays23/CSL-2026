import type { RequestHandler } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env.config.js";
import { UserModel } from "../modules/users/user.model.js";

export const optionalAuthenticate:RequestHandler=async(req,_res,next)=>{
  const token=req.cookies?.csl_token as string|undefined;
  if(!token){next();return;}
  let payload:jwt.JwtPayload;
  try{payload=jwt.verify(token,env.JWT_SECRET) as jwt.JwtPayload;}
  catch{next();return;}
  if(!payload.sub||payload.role!=="admin"){next();return;}
  try{
    const user=await UserModel.findById(payload.sub).select("email role status").lean().exec();
    // A blocked/deleted admin becomes a normal public visitor on public read routes.
    if(user&&user.status==="active"&&user.role==="admin"){
      req.user={id:String(user._id),role:"admin",email:user.email};
    }
    next();
  }catch(error){next(error);}
};
