import type { RequestHandler } from "express";
import { asyncHandler } from "../../shared/utils/asyncHandler.js";
import { sendSuccess } from "../../shared/responses/response.helper.js";
import { SettingsService } from "./settings.service.js";
export class SettingsController {
  constructor(private readonly service:SettingsService){}
  get:RequestHandler=asyncHandler(async(_req,res)=>sendSuccess(res,await this.service.get(),"Settings fetched"));
  update:RequestHandler=asyncHandler(async(req,res)=>sendSuccess(res,await this.service.update(req.body as Record<string,unknown>),"Settings updated"));
}
