import { AppError } from "../../shared/errors/appError.js";
import { SettingsService } from "../settings/settings.service.js";
import { TeamRepository } from "../teams/team.repository.js";
import { PlayerRepository } from "../players/player.repository.js";
import type { AuctionCompletionResult, AuctionStartResult, AuctionValidationIssue } from "./auction.types.js";
export class AuctionService {
  constructor(private readonly settingsService: SettingsService, private readonly teamRepository: TeamRepository, private readonly playerRepository: PlayerRepository) {}
  async startAuction(): Promise<AuctionStartResult> {
    const settings = await this.settingsService.get();
    if (settings.auctionState === "completed") throw new AppError("Reopen the auction before starting it", 409, "AUCTION_COMPLETED");
    await this.settingsService.updateSettings({ auctionState: "in_progress", auctionCompletedAt: null });
    return { auctionState: "in_progress", auctionCompletedAt: null };
  }
  async reopenAuction(): Promise<AuctionStartResult> {
    await this.settingsService.updateSettings({ auctionState: "in_progress", auctionCompletedAt: null });
    return { auctionState: "in_progress", auctionCompletedAt: null };
  }
  async completeAuction(): Promise<AuctionCompletionResult> {
    const settings = await this.settingsService.get();
    if (settings.auctionState !== "in_progress") throw new AppError("Start or reopen the auction before completing it", 409, "AUCTION_NOT_IN_PROGRESS");
    const activeTeams = await this.teamRepository.list({ status: "active" }, 1, 100, { name: 1 });
    const issues: AuctionValidationIssue[] = [];
    if (activeTeams.total !== settings.maxActiveTeams) issues.push({ scope: "Tournament", message: `Expected ${settings.maxActiveTeams} active teams; found ${activeTeams.total}` });
    if (await this.playerRepository.count({ status: "active" }) > settings.maxActivePlayers) issues.push({ scope: "Auction", message: "Active player limit exceeded" });
    for (const team of activeTeams.items) {
      const squad = await this.playerRepository.getTeamPlayers(String(team._id));
      const spend = squad.reduce((total, player) => total + player.auctionPrice, 0);
      const iconCount = squad.filter((player) => player.isIconPlayer).length;
      const goalkeeperCount = squad.filter((player) => player.position === "GK").length;
      if (squad.length !== settings.maxPlayersPerTeam) issues.push({ scope: team.name, message: `Squad has ${squad.length}; requires exactly ${settings.maxPlayersPerTeam}` });
      if (spend > settings.auctionBudgetPerTeam) issues.push({ scope: team.name, message: "Auction budget exceeded" });
      if (iconCount !== settings.requiredIconPlayers) issues.push({ scope: team.name, message: `Requires ${settings.requiredIconPlayers} icon player(s); found ${iconCount}` });
      if (goalkeeperCount !== settings.requiredGoalkeepers) issues.push({ scope: team.name, message: `Requires ${settings.requiredGoalkeepers} goalkeeper(s); found ${goalkeeperCount}` });
    }
    if (await this.playerRepository.invalidSoldCount()) issues.push({ scope: "Auction", message: "One or more sold players have no team or an invalid auction price" });
    const pendingPlayers = await this.playerRepository.count({ status: "active", auctionStatus: "pending" });
    if (pendingPlayers) issues.push({ scope: "Auction", message: `${pendingPlayers} active player(s) are still pending` });
    if (issues.length) throw new AppError("Auction completion failed", 422, "AUCTION_VALIDATION_FAILED", { auction: issues.map((issue) => `${issue.scope}: ${issue.message}`).join("; ") });
    const completedAt = new Date();
    await this.settingsService.updateSettings({ auctionState: "completed", auctionCompletedAt: completedAt });
    return { auctionState: "completed", auctionCompletedAt: completedAt };
  }
}
