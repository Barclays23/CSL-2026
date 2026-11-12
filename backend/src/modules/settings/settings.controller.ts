import type { RequestHandler } from "express";
import { asyncHandler } from "../../shared/utils/asyncHandler.js";
import { sendSuccess } from "../../shared/responses/response.helper.js";
import type { ISettingsController, ISettingsService, SettingsEntity, SettingsResponseDTO } from "./settings.types.js";
import { settingsUpdateSchema } from "./settings.dto.js";

export class SettingsController implements ISettingsController {
  constructor(private readonly settingsService: ISettingsService) {}

  getTournamentSettings: RequestHandler = asyncHandler(async (_request, response) => {
    const settings = await this.settingsService.getTournamentSettings();
    sendSuccess(response, this.mapSettingsToResponseDTO(settings), "Settings fetched");
  });

  updateTournamentSettings: RequestHandler = asyncHandler(async (request, response) => {
    const input = settingsUpdateSchema.parse(request.body);
    const settings = await this.settingsService.updateTournamentSettings(input);
    sendSuccess(response, this.mapSettingsToResponseDTO(settings), "Settings updated");
  });

  private mapSettingsToResponseDTO(settings: SettingsEntity): SettingsResponseDTO {
    return {
      _id: String(settings._id),
      singletonKey: settings.singletonKey,
      tournamentName: settings.tournamentName,
      startDate: settings.startDate.toISOString(),
      endDate: settings.endDate.toISOString(),
      maxActivePlayers: settings.maxActivePlayers,
      maxActiveTeams: settings.maxActiveTeams,
      maxPlayersPerTeam: settings.maxPlayersPerTeam,
      auctionBudgetPerTeam: settings.auctionBudgetPerTeam,
      requiredIconPlayers: settings.requiredIconPlayers,
      requiredGoalkeepers: settings.requiredGoalkeepers,
      pointsRule: {
        win: settings.pointsRule.win,
        draw: settings.pointsRule.draw,
        loss: settings.pointsRule.loss,
      },
      auctionState: settings.auctionState,
      auctionCompletedAt: settings.auctionCompletedAt?.toISOString() ?? null,
      updatedAt: settings.updatedAt.toISOString(),
    };
  }
}
