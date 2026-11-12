import type { RequestHandler } from "express";
import { AppError } from "../shared/errors/appError.js";
export const requireAdmin: RequestHandler = (req,_res,next) => {
  if (!req.user || req.user.role !== "admin") return next(new AppError("Administrator access required",403,"FORBIDDEN"));
  next();
};
