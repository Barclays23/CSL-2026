import type { RequestHandler } from "express";
import { asyncHandler } from "../../shared/utils/asyncHandler.js";
import { sendSuccess } from "../../shared/responses/response.helper.js";
import { SettingsService } from "./settings._settingsService.js";
export class SettingsController {
  constructor(private readonly _settingsService:SettingsService){}
  get:RequestHandler=asyncHandler(async(_req,res)=>sendSuccess(res,await this._settingsService.get(),"Settings fetched"));
  update:RequestHandler=asyncHandler(async(req,res)=>sendSuccess(res,await this._settingsService.update(req.body as Record<string,unknown>),"Settings updated"));
}
