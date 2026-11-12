import type { QueryFilter, Types } from "mongoose";
import { AppError } from "../../shared/errors/appError.js";
import { TeamRepository } from "./team.repository.js";
import { PlayerRepository } from "../players/player.repository.js";
import { SettingsService } from "../settings/settings.service.js";
import type { TeamCreateInput, TeamQueryInput, TeamUpdateInput } from "./team.dto.js";
import type { TeamAuctionSummaryDTO, TeamResponseDTO } from "./team.types.js";
import type { TeamRecord } from "./team.model.js";
export class TeamService {
  constructor(private readonly teamRepository: TeamRepository, private readonly playerRepository: PlayerRepository, private readonly settingsService: SettingsService) {}
  async getTeams(query: TeamQueryInput, isAdmin: boolean): Promise<{ items: TeamResponseDTO[]; total: number; page: number; limit: number }> {
    const filter: QueryFilter<TeamRecord> = {};
    if (isAdmin && query.status) filter.status = query.status; else if (!isAdmin) filter.status = "active";
    if (query.search) filter.name = { $regex: query.search, $options: "i" };
    if (query.groupName) filter.groupName = query.groupName;
    const result = await this.teamRepository.list(filter, query.page, query.limit, { name: 1 });
    return { items: result.items.map((team) => this.mapTeamToResponseDTO(team)), total: result.total, page: query.page, limit: query.limit };
  }
  private mapTeamToResponseDTO(team: TeamRecord & { _id: Types.ObjectId }): TeamResponseDTO {
    return { _id: String(team._id), name: team.name, shortName: team.shortName ?? null, logo: team.logo ?? null, poster: team.poster ?? null, groupName: team.groupName ?? null, status: team.status, createdAt: team.createdAt.toISOString(), updatedAt: team.updatedAt.toISOString() };
  }
  async getTeamById(teamId: string): Promise<TeamResponseDTO> {
    const team = await this.teamRepository.findById(teamId);
    if (!team || team.status !== "active") throw new AppError("Team not found", 404, "NOT_FOUND");
    return this.mapTeamToResponseDTO(team);
  }
  async createTeam(data: TeamCreateInput): Promise<TeamResponseDTO> {
    const settings = await this.settingsService.get();
    if (data.status !== "inactive" && await this.teamRepository.countActive() >= settings.maxActiveTeams) throw new AppError("Maximum active team limit reached", 422, "TEAM_LIMIT");
    if (await this.teamRepository.findByName(data.name)) throw new AppError("Team name already exists", 409, "DUPLICATE_TEAM", { name: "Team name already exists" });
    return this.mapTeamToResponseDTO(await this.teamRepository.create(data));
  }
  async updateTeam(teamId: string, data: TeamUpdateInput): Promise<TeamResponseDTO> {
    const current = await this.teamRepository.findById(teamId);
    if (!current) throw new AppError("Team not found", 404, "NOT_FOUND");
    if (data.name && data.name.trim().toLowerCase() !== current.name.toLowerCase()) {
      const duplicate = await this.teamRepository.findByName(data.name);
      if (duplicate && String(duplicate._id) !== teamId) throw new AppError("Team name already exists", 409, "DUPLICATE_TEAM", { name: "Team name already exists" });
    }
    if (data.status === "active" && current.status !== "active") {
      const settings = await this.settingsService.get();
      if (await this.teamRepository.countActive() >= settings.maxActiveTeams) throw new AppError("Maximum active team limit reached", 422, "TEAM_LIMIT");
    }
    if (data.status === "inactive") {
      const references = await this.teamRepository.findReferenced(teamId);
      if (references.players || references.managers || references.matches) throw new AppError("Resolve this team's players, managers and fixtures before deactivating it", 409, "TEAM_REFERENCED");
    }
    const updated = await this.teamRepository.update(teamId, data);
    if (!updated) throw new AppError("Team not found", 404, "NOT_FOUND");
    return this.mapTeamToResponseDTO(updated);
  }
  async deleteTeam(teamId: string): Promise<void> {
    const references = await this.teamRepository.findReferenced(teamId);
    if (references.players || references.matches || references.managers) throw new AppError("Team has player, manager or match references", 409, "TEAM_REFERENCED");
    if (!await this.teamRepository.remove(teamId)) throw new AppError("Team not found", 404, "NOT_FOUND");
  }
  async getAuctionSummary(): Promise<TeamAuctionSummaryDTO> {
    const settings = await this.settingsService.get();
    const teams = await this.teamRepository.list({ status: "active" }, 1, 100, { name: 1 });
    const teamCards = await Promise.all(teams.items.map(async (team) => {
      const players = await this.playerRepository.getTeamPlayers(String(team._id));
      const purchaseCost = players.reduce((total, player) => total + player.auctionPrice, 0);
      const teamDTO = this.mapTeamToResponseDTO(team);
      const playerDTOs = players.map((player) => ({ _id: String(player._id), name: player.name, position: player.position, isIconPlayer: player.isIconPlayer, teamRef: String(player.teamRef), team: { _id: String(team._id), name: team.name, shortName: team.shortName ?? null, logo: team.logo ?? null, groupName: team.groupName ?? null }, jerseyNo: player.jerseyNo ?? null, auctionPrice: player.auctionPrice, auctionStatus: player.auctionStatus, status: player.status, profilePic: player.profilePic ?? null }));
      return { team: teamDTO, players: playerDTOs, stats: { auctionBudget: settings.auctionBudgetPerTeam, purchaseCost, remainingBalance: settings.auctionBudgetPerTeam - purchaseCost, playerCount: players.length, remainingSlots: settings.maxPlayersPerTeam - players.length, averagePurchaseCost: players.length ? purchaseCost / players.length : 0, iconPlayerCount: players.filter((player) => player.isIconPlayer).length, goalkeeperCount: players.filter((player) => player.position === "GK").length, maxPlayers: settings.maxPlayersPerTeam, requiredIcons: settings.requiredIconPlayers, requiredGoalkeepers: settings.requiredGoalkeepers } };
    }));
    const totals = await this.playerRepository.auctionCounts();
    return { totals: { ...totals, activeTeams: teams.total }, teams: teamCards };
  }
}
