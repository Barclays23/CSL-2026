import { Types } from "mongoose";
import { AppError } from "../../shared/errors/appError.js";
import type { PaginatedResult } from "../../shared/types/common.types.js";
import { normalizeEmail, normalizeMobile } from "../../shared/utils/normalizeInput.js";
import type { ISettingsService } from "../settings/settings.types.js";
import type { TeamRepositoryContract } from "../teams/team.types.js";
import type { PlayerAssignmentInput } from "./player.dto.js";
import type {
  IPlayerService,
  PlayerAdminDTO,
  PlayerCreateDTO,
  PlayerEntity,
  PlayerFields,
  PlayerListFilter,
  PlayerPublicDTO,
  PlayerQueryDTO,
  PlayerRepositoryContract,
  PlayerResponseDTO,
  PlayerUpdateDTO,
  PopulatedPlayerEntity,
} from "./player.types.js";

export class PlayerService implements IPlayerService {
  constructor(
    private readonly _playerRepository: PlayerRepositoryContract,
    private readonly _teamRepository: TeamRepositoryContract,
    private readonly _settingsService: ISettingsService,
  ) {}

  async getPlayers(
    query: PlayerQueryDTO,
    isAdmin: boolean,
  ): Promise<PaginatedResult<PlayerResponseDTO>> {
    const filter: PlayerListFilter = {};
    if (query.search) filter.name = { $regex: query.search, $options: "i" };
    if (query.position) filter.position = query.position;
    if (isAdmin && query.status) filter.status = query.status;
    else if (!isAdmin) filter.status = "active";
    if (isAdmin && query.auctionStatus) filter.auctionStatus = query.auctionStatus;
    if (query.teamRef === "unassigned") filter.teamRef = null;
    else if (query.teamRef) filter.teamRef = new Types.ObjectId(query.teamRef);

    const result = await this._playerRepository.findPlayers(filter, query.page, query.limit);
    return {
      items: result.items.map((player) => this.mapPlayerToResponseDTO(player, isAdmin)),
      pagination: {
        page: query.page,
        limit: query.limit,
        total: result.total,
        totalPages: Math.ceil(result.total / query.limit),
      },
    };
  }

  async getPlayerById(playerId: string, isAdmin: boolean): Promise<PlayerResponseDTO> {
    this.ensureValidPlayerId(playerId);
    const player = await this._playerRepository.findPlayerWithTeamById(playerId);
    if (!player || (!isAdmin && player.status !== "active")) {
      throw new AppError("Player not found", 404, "PLAYER_NOT_FOUND");
    }
    return this.mapPlayerToResponseDTO(player, isAdmin);
  }

  async createPlayer(input: PlayerCreateDTO): Promise<PlayerAdminDTO> {
    const settings = await this._settingsService.getTournamentSettings();
    const mobile = normalizeMobile(input.mobile);
    const email = normalizeEmail(input.email);

    await this.ensurePlayerContactDetailsAreUnique(mobile, email);

    if (input.status !== "inactive" && await this._playerRepository.countPlayers({ status: "active" }) >= settings.maxActivePlayers) {
      throw new AppError("Maximum active player limit reached", 422, "PLAYER_LIMIT");
    }

    const auctionStatus = input.status === "inactive" ? "pending" : input.auctionStatus;
    let teamRef: Types.ObjectId | null = null;
    let jerseyNo: number | null = null;
    let auctionPrice = 0;

    if (input.status === "inactive") {
      teamRef = null;
    } else if (auctionStatus === "sold") {
      if (settings.auctionState !== "in_progress") {
        throw new AppError("Start or reopen the auction before assigning a player", 409, "AUCTION_NOT_IN_PROGRESS");
      }
      if (!input.teamRef || input.auctionPrice <= 0) {
        throw new AppError("A sold player requires a team and a positive auction price", 422, "INVALID_SOLD_PLAYER");
      }
      await this.validatePlayerAssignment(
        input.teamRef,
        undefined,
        input.auctionPrice,
        input.isIconPlayer,
        input.position,
        input.jerseyNo ?? null,
      );
      teamRef = new Types.ObjectId(input.teamRef);
      jerseyNo = input.jerseyNo ?? null;
      auctionPrice = input.auctionPrice;
    } else if (input.teamRef || input.jerseyNo != null || input.auctionPrice !== 0) {
      throw new AppError("Pending and unsold players cannot have a team, jersey number or auction price", 422, "INVALID_AUCTION_FIELDS");
    }

    const playerFields: PlayerFields = {
      name: input.name.trim(),
      mobile,
      email,
      dateOfBirth: input.dateOfBirth ?? null,
      position: input.position,
      isIconPlayer: input.isIconPlayer,
      teamRef,
      jerseyNo,
      auctionPrice,
      auctionStatus,
      status: input.status,
      profilePic: input.profilePic ?? null,
    };

    const createdPlayer = await this._playerRepository.createPlayer(playerFields);
    const populatedPlayer = await this._playerRepository.findPlayerWithTeamById(String(createdPlayer._id));
    if (!populatedPlayer) throw new AppError("Created player could not be retrieved", 500, "PLAYER_CREATE_FAILED");
    return this.mapPlayerToAdminDTO(populatedPlayer);
  }

  async updatePlayer(playerId: string, input: PlayerUpdateDTO): Promise<PlayerAdminDTO> {
    this.ensureValidPlayerId(playerId);
    const currentPlayer = await this._playerRepository.findPlayerById(playerId);
    if (!currentPlayer) throw new AppError("Player not found", 404, "PLAYER_NOT_FOUND");

    await this.ensureUpdatedPlayerContactDetailsAreUnique(playerId, input);

    if (input.status === "inactive") {
      const profileUpdates = this.buildPlayerProfileUpdates(input);
      return this.deactivatePlayerWithProfileUpdates(playerId, profileUpdates);
    }

    const settings = await this._settingsService.getTournamentSettings();
    const updateFields: Partial<PlayerFields> = this.buildPlayerUpdateFields(input, currentPlayer);

    if (input.status === "active" && currentPlayer.status === "inactive") {
      const activePlayerCount = await this._playerRepository.countPlayers({ status: "active" });
      if (activePlayerCount >= settings.maxActivePlayers) {
        throw new AppError("Maximum active player limit reached", 422, "PLAYER_LIMIT");
      }
    }

    const auctionChanged = this.hasAuctionFieldsChanged(input, currentPlayer);
    if (auctionChanged && settings.auctionState === "completed") {
      throw new AppError("Reopen the auction before changing auction-related player data", 409, "AUCTION_COMPLETED");
    }

    const mergedPlayer = { ...currentPlayer, ...updateFields };
    if (mergedPlayer.auctionStatus === "sold") {
      if (!mergedPlayer.teamRef || mergedPlayer.auctionPrice <= 0) {
        throw new AppError("A sold player requires a team and a positive auction price", 422, "INVALID_SOLD_PLAYER");
      }
      if (auctionChanged) {
        await this.validatePlayerAssignment(
          String(mergedPlayer.teamRef),
          playerId,
          mergedPlayer.auctionPrice,
          mergedPlayer.isIconPlayer,
          mergedPlayer.position,
          mergedPlayer.jerseyNo,
        );
      }
    } else {
      updateFields.teamRef = null;
      updateFields.jerseyNo = null;
      updateFields.auctionPrice = 0;
    }

    const updatedPlayer = await this._playerRepository.updatePlayer(playerId, updateFields);
    if (!updatedPlayer) throw new AppError("Player not found", 404, "PLAYER_NOT_FOUND");
    const populatedPlayer = await this._playerRepository.findPlayerWithTeamById(playerId);
    if (!populatedPlayer) throw new AppError("Updated player could not be retrieved", 500, "PLAYER_UPDATE_FAILED");
    return this.mapPlayerToAdminDTO(populatedPlayer);
  }

  async assignPlayerToTeam(playerId: string, input: PlayerAssignmentInput): Promise<PlayerAdminDTO> {
    this.ensureValidPlayerId(playerId);
    const player = await this._playerRepository.findPlayerById(playerId);
    if (!player || player.status !== "active") throw new AppError("Active player not found", 404, "PLAYER_NOT_FOUND");

    const settings = await this._settingsService.getTournamentSettings();
    if (settings.auctionState !== "in_progress") {
      throw new AppError("Start or reopen the auction before making assignments", 409, "AUCTION_NOT_IN_PROGRESS");
    }

    await this.validatePlayerAssignment(
      input.teamRef,
      playerId,
      input.auctionPrice,
      player.isIconPlayer,
      player.position,
      input.jerseyNo ?? null,
    );

    const updatedPlayer = await this._playerRepository.updatePlayer(playerId, {
      teamRef: new Types.ObjectId(input.teamRef),
      auctionPrice: input.auctionPrice,
      jerseyNo: input.jerseyNo ?? null,
      auctionStatus: "sold",
    });
    if (!updatedPlayer) throw new AppError("Player not found", 404, "PLAYER_NOT_FOUND");

    const populatedPlayer = await this._playerRepository.findPlayerWithTeamById(playerId);
    if (!populatedPlayer) throw new AppError("Updated player could not be retrieved", 500, "PLAYER_UPDATE_FAILED");
    return this.mapPlayerToAdminDTO(populatedPlayer);
  }

  async markPlayerUnsold(playerId: string): Promise<PlayerAdminDTO> {
    this.ensureValidPlayerId(playerId);
    const settings = await this._settingsService.getTournamentSettings();
    if (settings.auctionState !== "in_progress") {
      throw new AppError("Start or reopen the auction before changing auction results", 409, "AUCTION_NOT_IN_PROGRESS");
    }

    const player = await this._playerRepository.findPlayerById(playerId);
    if (!player || player.status !== "active") throw new AppError("Active player not found", 404, "PLAYER_NOT_FOUND");

    const updatedPlayer = await this._playerRepository.updatePlayer(playerId, {
      teamRef: null,
      jerseyNo: null,
      auctionPrice: 0,
      auctionStatus: "unsold",
    });
    if (!updatedPlayer) throw new AppError("Player not found", 404, "PLAYER_NOT_FOUND");

    const populatedPlayer = await this._playerRepository.findPlayerWithTeamById(playerId);
    if (!populatedPlayer) throw new AppError("Updated player could not be retrieved", 500, "PLAYER_UPDATE_FAILED");
    return this.mapPlayerToAdminDTO(populatedPlayer);
  }

  async deactivatePlayer(playerId: string): Promise<PlayerAdminDTO> {
    return this.deactivatePlayerWithProfileUpdates(playerId, {});
  }

  private async deactivatePlayerWithProfileUpdates(
    playerId: string,
    profileUpdates: Partial<PlayerFields>,
  ): Promise<PlayerAdminDTO> {
    this.ensureValidPlayerId(playerId);
    const player = await this._playerRepository.findPlayerById(playerId);
    if (!player) throw new AppError("Player not found", 404, "PLAYER_NOT_FOUND");

    const deactivatedPlayer = await this._playerRepository.updatePlayer(playerId, {
      ...profileUpdates,
      status: "inactive",
      teamRef: null,
      jerseyNo: null,
      auctionPrice: 0,
      auctionStatus: "pending",
    });
    if (!deactivatedPlayer) throw new AppError("Player not found", 404, "PLAYER_NOT_FOUND");

    const settings = await this._settingsService.getTournamentSettings();
    if (settings.auctionState === "completed") {
      await this._settingsService.updateAuctionLifecycle("in_progress", null);
    }

    const populatedPlayer = await this._playerRepository.findPlayerWithTeamById(playerId);
    if (!populatedPlayer) throw new AppError("Deactivated player could not be retrieved", 500, "PLAYER_UPDATE_FAILED");
    return this.mapPlayerToAdminDTO(populatedPlayer);
  }

  async deletePlayer(playerId: string): Promise<void> {
    this.ensureValidPlayerId(playerId);
    const player = await this._playerRepository.findPlayerById(playerId);
    if (!player) throw new AppError("Player not found", 404, "PLAYER_NOT_FOUND");

    if (await this._playerRepository.countPlayerGoalReferences(playerId) > 0) {
      throw new AppError("Player is referenced by match goals. Deactivate instead.", 409, "PLAYER_REFERENCED");
    }

    const deleted = await this._playerRepository.deletePlayer(playerId);
    if (!deleted) throw new AppError("Player not found", 404, "PLAYER_NOT_FOUND");
  }

  private async validatePlayerAssignment(
    teamId: string,
    excludePlayerId: string | undefined,
    auctionPrice: number,
    isIconPlayer: boolean,
    position: string,
    jerseyNo: number | null,
  ): Promise<void> {
    const team = await this._teamRepository.findTeamById(teamId);
    if (!team || team.status !== "active") throw new AppError("Select an active team", 422, "INVALID_TEAM");

    const settings = await this._settingsService.getTournamentSettings();
    const assignedPlayers = await this._playerRepository.findSoldPlayersByTeam(teamId);
    const existingPlayers = assignedPlayers.filter((player) => String(player._id) !== excludePlayerId);

    if (existingPlayers.length >= settings.maxPlayersPerTeam) {
      throw new AppError("Team squad limit reached", 422, "SQUAD_LIMIT");
    }

    const currentSpend = existingPlayers.reduce((total, player) => total + player.auctionPrice, 0);
    if (currentSpend + auctionPrice > settings.auctionBudgetPerTeam) {
      throw new AppError("Team auction budget exceeded", 422, "BUDGET_EXCEEDED");
    }

    if (isIconPlayer && existingPlayers.some((player) => player.isIconPlayer)) {
      throw new AppError("Team already has an icon player", 422, "ICON_LIMIT");
    }

    if (position === "GK" && existingPlayers.some((player) => player.position === "GK")) {
      throw new AppError("Team already has a goalkeeper", 422, "GOALKEEPER_LIMIT");
    }

    if (jerseyNo !== null && await this._playerRepository.findPlayerWithJerseyNumber(teamId, jerseyNo, excludePlayerId)) {
      throw new AppError("Jersey number already used in this team", 409, "DUPLICATE_JERSEY", {
        jerseyNo: "Jersey number already used in this team",
      });
    }
  }

  private async ensurePlayerContactDetailsAreUnique(mobile: string, email: string | null): Promise<void> {
    if (await this._playerRepository.findPlayerByMobile(mobile)) {
      throw new AppError("Mobile already exists", 409, "DUPLICATE_MOBILE", { mobile: "Mobile already exists" });
    }
    if (email && await this._playerRepository.findPlayerByEmail(email)) {
      throw new AppError("Email already exists", 409, "DUPLICATE_EMAIL", { email: "Email already exists" });
    }
  }

  private async ensureUpdatedPlayerContactDetailsAreUnique(
    playerId: string,
    input: PlayerUpdateDTO,
  ): Promise<void> {
    if (input.mobile !== undefined) {
      const mobile = normalizeMobile(input.mobile);
      const existing = await this._playerRepository.findPlayerByMobile(mobile);
      if (existing && String(existing._id) !== playerId) {
        throw new AppError("Mobile already exists", 409, "DUPLICATE_MOBILE", { mobile: "Mobile already exists" });
      }
    }

    if (input.email !== undefined) {
      const email = normalizeEmail(input.email);
      const existing = email ? await this._playerRepository.findPlayerByEmail(email) : null;
      if (existing && String(existing._id) !== playerId) {
        throw new AppError("Email already exists", 409, "DUPLICATE_EMAIL", { email: "Email already exists" });
      }
    }

  }

  private buildPlayerUpdateFields(input: PlayerUpdateDTO, current: PlayerEntity): Partial<PlayerFields> {
    const updates: Partial<PlayerFields> = {};
    if (input.name !== undefined) updates.name = input.name.trim();
    if (input.mobile !== undefined) updates.mobile = normalizeMobile(input.mobile);
    if (input.email !== undefined) updates.email = normalizeEmail(input.email);
    if (input.dateOfBirth !== undefined) updates.dateOfBirth = input.dateOfBirth;
    if (input.position !== undefined) updates.position = input.position;
    if (input.isIconPlayer !== undefined) updates.isIconPlayer = input.isIconPlayer;
    if (input.teamRef !== undefined) updates.teamRef = input.teamRef ? new Types.ObjectId(input.teamRef) : null;
    if (input.jerseyNo !== undefined) updates.jerseyNo = input.jerseyNo;
    if (input.auctionPrice !== undefined) updates.auctionPrice = input.auctionPrice;
    if (input.auctionStatus !== undefined) updates.auctionStatus = input.auctionStatus;
    if (input.status !== undefined) updates.status = input.status;
    if (input.profilePic !== undefined) updates.profilePic = input.profilePic;
    if (current.status === "inactive" && input.status === undefined) updates.status = "inactive";
    return updates;
  }

  private buildPlayerProfileUpdates(input: PlayerUpdateDTO): Partial<PlayerFields> {
    const updates: Partial<PlayerFields> = {};
    if (input.name !== undefined) updates.name = input.name.trim();
    if (input.mobile !== undefined) updates.mobile = normalizeMobile(input.mobile);
    if (input.email !== undefined) updates.email = normalizeEmail(input.email);
    if (input.dateOfBirth !== undefined) updates.dateOfBirth = input.dateOfBirth;
    if (input.position !== undefined) updates.position = input.position;
    if (input.isIconPlayer !== undefined) updates.isIconPlayer = input.isIconPlayer;
    if (input.profilePic !== undefined) updates.profilePic = input.profilePic;
    return updates;
  }

  private hasAuctionFieldsChanged(input: PlayerUpdateDTO, current: PlayerEntity): boolean {
    if (input.teamRef !== undefined && (input.teamRef ?? null) !== (current.teamRef ? String(current.teamRef) : null)) return true;
    if (input.jerseyNo !== undefined && input.jerseyNo !== current.jerseyNo) return true;
    if (input.auctionPrice !== undefined && input.auctionPrice !== current.auctionPrice) return true;
    if (input.auctionStatus !== undefined && input.auctionStatus !== current.auctionStatus) return true;
    if (input.isIconPlayer !== undefined && input.isIconPlayer !== current.isIconPlayer) return true;
    if (input.position !== undefined && input.position !== current.position) return true;
    if (input.status !== undefined && input.status !== current.status) return true;
    return false;
  }

  private mapPlayerToResponseDTO(player: PopulatedPlayerEntity, isAdmin: boolean): PlayerResponseDTO {
    return isAdmin ? this.mapPlayerToAdminDTO(player) : this.mapPlayerToPublicDTO(player);
  }

  private mapPlayerToPublicDTO(player: PopulatedPlayerEntity): PlayerPublicDTO {
    const populatedTeam = player.teamRef instanceof Types.ObjectId ? null : player.teamRef;
    return {
      _id: String(player._id),
      name: player.name,
      position: player.position,
      isIconPlayer: player.isIconPlayer,
      teamRef: player.teamRef ? String(populatedTeam?._id ?? player.teamRef) : null,
      team: populatedTeam ? {
        _id: String(populatedTeam._id),
        name: populatedTeam.name,
        shortName: populatedTeam.shortName,
        logo: populatedTeam.logo,
        groupName: populatedTeam.groupName,
      } : null,
      jerseyNo: player.jerseyNo,
      auctionPrice: player.auctionPrice,
      auctionStatus: player.auctionStatus,
      status: player.status,
      profilePic: player.profilePic,
    };
  }

  private mapPlayerToAdminDTO(player: PopulatedPlayerEntity): PlayerAdminDTO {
    return {
      ...this.mapPlayerToPublicDTO(player),
      mobile: player.mobile,
      email: player.email,
      dateOfBirth: player.dateOfBirth?.toISOString() ?? null,
    };
  }

  private ensureValidPlayerId(playerId: string): void {
    if (!Types.ObjectId.isValid(playerId)) throw new AppError("Invalid player ID", 400, "INVALID_ID");
  }
}
