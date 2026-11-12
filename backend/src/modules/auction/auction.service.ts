import { AppError } from "../../shared/errors/appError.js";
import type { IPlayerRepository } from "../players/player.types.js";
import type { ISettingsService } from "../settings/settings.types.js";
import type { ITeamRepository } from "../teams/team.types.js";
import type { SettingsEntity } from "../settings/settings.types.js";
import type { AuctionCompletionValidationResult, AuctionTeamValidation, IAuctionService } from "./auction.types.js";




export class AuctionService implements IAuctionService {
  constructor(
    private readonly _settingsService: ISettingsService,
    private readonly _teamRepository: ITeamRepository,
    private readonly _playerRepository: IPlayerRepository,
  ) {}

  async startAuction(): Promise<SettingsEntity> {
    const settings = await this._settingsService.getTournamentSettings();
    if (settings.auctionState === "completed") {
      throw new AppError("Reopen the auction before starting it again", 409, "AUCTION_COMPLETED");
    }
    return this._settingsService.updateAuctionLifecycle("in_progress", null);
  }

  async reopenAuction(): Promise<SettingsEntity> {
    const settings = await this._settingsService.getTournamentSettings();
    if (settings.auctionState === "not_started") {
      throw new AppError("The auction has not been started yet", 409, "AUCTION_NOT_STARTED");
    }
    return this._settingsService.updateAuctionLifecycle("in_progress", null);
  }

  async validateAuctionCompletion(): Promise<AuctionCompletionValidationResult> {
    const settings = await this._settingsService.getTournamentSettings();
    const activeTeams = await this._teamRepository.findTeams({ status: "active" }, 1, 100);
    const errors: AuctionTeamValidation[] = [];

    if (activeTeams.total !== settings.maxActiveTeams) {
      errors.push({
        teamId: null,
        teamName: "Tournament",
        message: `Expected ${settings.maxActiveTeams} active teams; found ${activeTeams.total}`,
      });
    }

    const activePlayers = await this._playerRepository.countPlayers({ status: "active" });
    if (activePlayers > settings.maxActivePlayers) {
      errors.push({
        teamId: null,
        teamName: "Auction",
        message: `Active player limit exceeded: ${activePlayers}/${settings.maxActivePlayers}`,
      });
    }

    for (const team of activeTeams.items) {
      const teamId = String(team._id);
      const players = await this._playerRepository.findSoldPlayersByTeam(teamId);
      const purchaseTotal = players.reduce((total, player) => total + player.auctionPrice, 0);
      const iconPlayerCount = players.filter((player) => player.isIconPlayer).length;
      const goalkeeperCount = players.filter((player) => player.position === "GK").length;

      if (players.length !== settings.maxPlayersPerTeam) {
        errors.push({
          teamId,
          teamName: team.name,
          message: `Squad has ${players.length}; requires exactly ${settings.maxPlayersPerTeam}`,
        });
      }
      if (purchaseTotal > settings.auctionBudgetPerTeam) {
        errors.push({
          teamId,
          teamName: team.name,
          message: `Auction budget exceeded: ${purchaseTotal}/${settings.auctionBudgetPerTeam}`,
        });
      }
      if (iconPlayerCount !== settings.requiredIconPlayers) {
        errors.push({
          teamId,
          teamName: team.name,
          message: `Requires ${settings.requiredIconPlayers} icon player(s); found ${iconPlayerCount}`,
        });
      }
      if (goalkeeperCount !== settings.requiredGoalkeepers) {
        errors.push({
          teamId,
          teamName: team.name,
          message: `Requires ${settings.requiredGoalkeepers} goalkeeper(s); found ${goalkeeperCount}`,
        });
      }
    }

    const invalidSoldPlayers = await this._playerRepository.countInvalidSoldPlayers();
    if (invalidSoldPlayers > 0) {
      errors.push({
        teamId: null,
        teamName: "Auction",
        message: `${invalidSoldPlayers} sold player(s) have an invalid team assignment or auction price`,
      });
    }

    const pendingPlayers = await this._playerRepository.countPlayers({
      status: "active",
      auctionStatus: "pending",
    });
    if (pendingPlayers > 0) {
      errors.push({
        teamId: null,
        teamName: "Auction",
        message: `${pendingPlayers} active player(s) are still pending`,
      });
    }

    return { valid: errors.length === 0, errors };
  }

  async completeAuction(): Promise<SettingsEntity> {
    const settings = await this._settingsService.getTournamentSettings();
    if (settings.auctionState !== "in_progress") {
      throw new AppError("Start or reopen the auction before completing it", 409, "AUCTION_NOT_IN_PROGRESS");
    }

    const validation = await this.validateAuctionCompletion();
    if (!validation.valid) {
      const fieldErrors: Record<string, string> = {};
      validation.errors.forEach((error, index) => {
        fieldErrors[`auctionValidation.${index + 1}`] = `${error.teamName}: ${error.message}`;
      });
      throw new AppError("Auction completion failed. Review the validation errors.", 422, "AUCTION_VALIDATION_FAILED", fieldErrors);
    }

    return this._settingsService.updateAuctionLifecycle("completed", new Date());
  }
}
