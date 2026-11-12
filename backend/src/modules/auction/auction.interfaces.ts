import type { AuctionCompletionValidationResult } from "./auction.dto.js";
import type { AuctionState } from "../settings/settings.types.js";
import type { SettingsEntity } from "../settings/settings.types.js";

export interface IAuctionService {
  startAuction(): Promise<SettingsEntity>;
  completeAuction(): Promise<SettingsEntity>;
  reopenAuction(): Promise<SettingsEntity>;
  validateAuctionCompletion(): Promise<AuctionCompletionValidationResult>;
}
export interface IAuctionController {
  startAuction: import("../../shared/types/common.types.js").ControllerMethod;
  completeAuction: import("../../shared/types/common.types.js").ControllerMethod;
  reopenAuction: import("../../shared/types/common.types.js").ControllerMethod;
}
