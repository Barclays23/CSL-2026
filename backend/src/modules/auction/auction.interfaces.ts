import type { AuctionCompletionValidationResult } from "./auction.dto.js";
import type { AuctionState } from "../settings/settings.types.js";
import type { SettingsEntity } from "../settings/settings.types.js";
import { ControllerMethod } from "../../shared/types/common.types.js";



export interface IAuctionService {
  startAuction(): Promise<SettingsEntity>;
  completeAuction(): Promise<SettingsEntity>;
  reopenAuction(): Promise<SettingsEntity>;
  validateAuctionCompletion(): Promise<AuctionCompletionValidationResult>;
}


export interface IAuctionController {
  startAuction: ControllerMethod;
  completeAuction: ControllerMethod;
  reopenAuction: ControllerMethod;
}
