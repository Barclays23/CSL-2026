import { Types } from "mongoose";
import { AppError } from "../../shared/errors/appError.js";
import type { PaginatedResult } from "../../shared/types/common.types.js";
import type { ISettingsService } from "../settings/settings.types.js";
import type { PlayerRepositoryContract } from "../players/player.types.js";
import type {
  ITeamService,
  TeamAuctionCardDTO,
  TeamAuctionSummaryDTO,
  TeamBriefDTO,
  TeamCreateDTO,
  TeamDTO,
  TeamFields,
  TeamListFilter,
  TeamQueryDTO,
  TeamRepositoryContract,
  TeamUpdateDTO,
} from "./team.types.js";

export class TeamService implements ITeamService {
  constructor(
    private readonly teamRepository: TeamRepositoryContract,
    private readonly playerRepository: PlayerRepositoryContract,
    private readonly settingsService: ISettingsService,
  ) {}

  async getTeams(query: TeamQueryDTO, isAdmin: boolean): Promise<PaginatedResult<TeamDTO>> {
    const filter: TeamListFilter = {};
    if (isAdmin && query.status) filter.status = query.status;
    else if (!isAdmin) filter.status = "active";
    if (query.search) filter.name = { $regex: query.search, $options: "i" };
    if (query.groupName) filter.groupName = query.groupName;

    const result = await this.teamRepository.findTeams(filter, query.page, query.limit);
    return {
      items: result.items.map((team) => this.mapTeamToDTO(team)),
      total: result.total,
      page: query.page,
      limit: query.limit,
    };
  }

  async getTeamById(teamId: string): Promise<TeamDTO> {
    this.ensureValidTeamId(teamId);
    const team = await this.teamRepository.findTeamById(teamId);
    if (!team || team.status !== "active") throw new AppError("Team not found", 404, "TEAM_NOT_FOUND");
    return this.mapTeamToDTO(team);
  }

  async createTeam(input: TeamCreateDTO): Promise<TeamDTO> {
    const settings = await this.settingsService.getTournamentSettings();
    if (input.status === "active" && await this.teamRepository.countActiveTeams() >= settings.maxActiveTeams) {
      throw new AppError("Maximum active team limit reached", 422, "TEAM_LIMIT");
    }

    const existingTeam = await this.teamRepository.findTeamByName(input.name);
    if (existingTeam) {
      throw new AppError("Team name already exists", 409, "DUPLICATE_TEAM", { name: "Team name already exists" });
    }

    const createdTeam = await this.teamRepository.createTeam(input);
    return this.mapTeamToDTO(createdTeam);
  }

  async updateTeam(teamId: string, input: TeamUpdateDTO): Promise<TeamDTO> {
    this.ensureValidTeamId(teamId);
    const existingTeam = await this.teamRepository.findTeamById(teamId);
    if (!existingTeam) throw new AppError("Team not found", 404, "TEAM_NOT_FOUND");

    if (input.name && input.name.trim().toLowerCase() !== existingTeam.name.toLowerCase()) {
      const duplicateTeam = await this.teamRepository.findTeamByName(input.name);
      if (duplicateTeam && String(duplicateTeam._id) !== teamId) {
        throw new AppError("Team name already exists", 409, "DUPLICATE_TEAM", { name: "Team name already exists" });
      }
    }

    if (input.status === "active" && existingTeam.status !== "active") {
      const settings = await this.settingsService.getTournamentSettings();
      if (await this.teamRepository.countActiveTeams() >= settings.maxActiveTeams) {
        throw new AppError("Maximum active team limit reached", 422, "TEAM_LIMIT");
      }
    }

    if (input.status === "inactive") {
      const references = await this.teamRepository.findTeamReferenceCounts(teamId);
      if (references.players > 0 || references.managers > 0 || references.matches > 0) {
        throw new AppError("Resolve this team's players, managers and fixtures before deactivating it", 409, "TEAM_REFERENCED");
      }
    }

    const updatedTeam = await this.teamRepository.updateTeam(teamId, input);
    if (!updatedTeam) throw new AppError("Team not found", 404, "TEAM_NOT_FOUND");
    return this.mapTeamToDTO(updatedTeam);
  }

  async deleteTeam(teamId: string): Promise<void> {
    this.ensureValidTeamId(teamId);
    const references = await this.teamRepository.findTeamReferenceCounts(teamId);
    if (references.players > 0 || references.managers > 0 || references.matches > 0) {
      throw new AppError("Team has player, manager or match references", 409, "TEAM_REFERENCED");
    }
    const deleted = await this.teamRepository.deleteTeam(teamId);
    if (!deleted) throw new AppError("Team not found", 404, "TEAM_NOT_FOUND");
  }

  async getTeamAuctionSummary(): Promise<TeamAuctionSummaryDTO> {
    const settings = await this.settingsService.getTournamentSettings();
    const activeTeams = await this.teamRepository.findTeams({ status: "active" }, 1, 100);
    const auctionTotals = await this.playerRepository.getPlayerAuctionCounts();

    const teamCards: TeamAuctionCardDTO[] = await Promise.all(
      activeTeams.items.map(async (team) => {
        const players = await this.playerRepository.findSoldPlayersByTeam(String(team._id));
        const purchaseCost = players.reduce((total, player) => total + player.auctionPrice, 0);
        const teamBrief: TeamBriefDTO = this.mapTeamToBriefDTO(team);

        return {
          team: this.mapTeamToDTO(team),
          players: players.map((player) => ({
            _id: String(player._id),
            name: player.name,
            position: player.position,
            isIconPlayer: player.isIconPlayer,
            teamRef: String(team._id),
            team: teamBrief,
            jerseyNo: player.jerseyNo,
            auctionPrice: player.auctionPrice,
            auctionStatus: player.auctionStatus,
            status: player.status,
            profilePic: player.profilePic,
          })),
          stats: {
            auctionBudget: settings.auctionBudgetPerTeam,
            purchaseCost,
            remainingBalance: settings.auctionBudgetPerTeam - purchaseCost,
            playerCount: players.length,
            remainingSlots: settings.maxPlayersPerTeam - players.length,
            averagePurchaseCost: players.length > 0 ? purchaseCost / players.length : 0,
            iconPlayerCount: players.filter((player) => player.isIconPlayer).length,
            goalkeeperCount: players.filter((player) => player.position === "GK").length,
            maxPlayers: settings.maxPlayersPerTeam,
            requiredIcons: settings.requiredIconPlayers,
            requiredGoalkeepers: settings.requiredGoalkeepers,
          },
        };
      }),
    );

    return {
      totals: {
        ...auctionTotals,
        activeTeams: activeTeams.total,
      },
      teams: teamCards,
    };
  }

  private mapTeamToDTO(team: TeamFields & { _id: Types.ObjectId; createdAt: Date; updatedAt: Date }): TeamDTO {
    return {
      _id: String(team._id),
      name: team.name,
      shortName: team.shortName,
      logo: team.logo,
      poster: team.poster,
      groupName: team.groupName,
      status: team.status,
      createdAt: team.createdAt.toISOString(),
      updatedAt: team.updatedAt.toISOString(),
    };
  }

  private mapTeamToBriefDTO(team: TeamFields & { _id: Types.ObjectId }): TeamBriefDTO {
    return {
      _id: String(team._id),
      name: team.name,
      shortName: team.shortName,
      logo: team.logo,
      groupName: team.groupName,
    };
  }

  private ensureValidTeamId(teamId: string): void {
    if (!Types.ObjectId.isValid(teamId)) throw new AppError("Invalid team ID", 400, "INVALID_ID");
  }
}
