import { AppError } from "../../shared/errors/appError.js";
import { SettingsRepository } from "./settings.repository.js";
export class SettingsService {
  constructor(private readonly _settingsRepo:SettingsRepository){}
  async get(){const value=await this._settingsRepo.getSingleton();if(!value) throw new AppError("Tournament _settingsRepo are not initialized",500,"SETTINGS_MISSING");return value;}
  async initialize(){return this._settingsRepo.initialize();}
  async update(data:Record<string,unknown>){
    const current=await this.get();
    const start=data.startDate ? new Date(String(data.startDate)) : new Date(String(current.startDate));
    const end=data.endDate ? new Date(String(data.endDate)) : new Date(String(current.endDate));
    if(end<start) throw new AppError("End date must be on or after start date",422,"INVALID_DATES",{endDate:"End date must be on or after start date"});
    const updated=await this._settingsRepo.updateSingleton(data);
    if(!updated) throw new AppError("Settings not found",404,"SETTINGS_NOT_FOUND");
    return updated;
  }
}
