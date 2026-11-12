import type { RequestHandler } from "express";
import { asyncHandler } from "../../shared/utils/asyncHandler.js";
import { sendSuccess } from "../../shared/responses/response.helper.js";
import { AuthService } from "./auth.service.js";
import { env } from "../../config/env.config.js";
export class AuthController {
  constructor(private readonly _authService:AuthService){}
  login:RequestHandler=asyncHandler(async(req,res)=>{
    const result=await this._authService.login(String(req.body.email),String(req.body.password));
    res.cookie("csl_token",result.token,{httpOnly:true,secure:env.COOKIE_SECURE,sameSite:env.COOKIE_SAME_SITE,path:"/",maxAge:24*60*60*1000});
    sendSuccess(res,result.user,"Login successful");
  });
  logout:RequestHandler=(_req,res)=>{res.clearCookie("csl_token",{httpOnly:true,secure:env.COOKIE_SECURE,sameSite:env.COOKIE_SAME_SITE,path:"/"});sendSuccess(res,null,"Logged out successfully");};
  me:RequestHandler=asyncHandler(async(req,res)=>{const user=await this._authService.me(String(req.user?.id));sendSuccess(res,user,"Current administrator");});
}
