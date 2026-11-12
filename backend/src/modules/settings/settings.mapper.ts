import type { SettingsEntity, SettingsResponseDTO } from "./settings.types.js";

export function mapSettingsEntityToResponseDTO(settings: SettingsEntity): SettingsResponseDTO {
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
