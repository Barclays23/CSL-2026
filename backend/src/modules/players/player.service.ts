import { Types } from "mongoose";
import { AppError } from "../../shared/errors/appError.js";
import { normalizeEmail, normalizeMobile } from "../../shared/utils/normalizeInput.js";
import { PlayerRepository } from "./player.repository.js";
import { TeamRepository } from "../teams/team.repository.js";
import { SettingsService } from "../settings/settings.service.js";
import type { PlayerListRecord, PlayerFilter, PlayerPosition, PlayerPublicDTO, PlayerAdminDTO, PlayerResponseDTO } from "./player.types.js";
import type { PlayerCreateInput, PlayerQueryInput, PlayerUpdateInput, AssignPlayerInput } from "./player.dto.js";
export class PlayerService {
  constructor(private readonly playerRepository: PlayerRepository, private readonly teamRepository: TeamRepository, private readonly settingsService: SettingsService) {}
  async getPlayers(query: PlayerQueryInput, isAdmin: boolean): Promise<{ items: PlayerResponseDTO[]; total: number; page: number; limit: number }> {
    const filter: PlayerFilter = {};
    if (query.search) filter.name = { $regex: query.search, $options: "i" };
    if (query.position) filter.position = query.position;
    if (isAdmin && query.status) filter.status = query.status; else if (!isAdmin) filter.status = "active";
    if (isAdmin && query.auctionStatus) filter.auctionStatus = query.auctionStatus;
    if (query.teamRef === "unassigned") filter.teamRef = null; else if (query.teamRef) filter.teamRef = query.teamRef;
    const result = await this.playerRepository.listPlayers(filter, query.page, query.limit);
    return { items: result.items.map((player) => this.mapPlayerResponse(player, isAdmin)), total: result.total, page: query.page, limit: query.limit };
  }
  private mapPlayerResponse(player: PlayerListRecord, isAdmin: boolean): PlayerResponseDTO {
    const populatedTeam = player.teamRef && !(player.teamRef instanceof Types.ObjectId) ? player.teamRef : null;
    const team = populatedTeam ? { _id: String(populatedTeam._id), name: populatedTeam.name, shortName: populatedTeam.shortName ?? null, logo: populatedTeam.logo ?? null, groupName: populatedTeam.groupName ?? null } : null;
    const base: PlayerPublicDTO = { _id: String(player._id), name: player.name, position: player.position, isIconPlayer: player.isIconPlayer, teamRef: team?._id ?? (player.teamRef ? String(player.teamRef) : null), team, jerseyNo: player.jerseyNo ?? null, auctionPrice: player.auctionPrice, auctionStatus: player.auctionStatus, status: player.status, profilePic: player.profilePic ?? null };
    return isAdmin ? { ...base, mobile: player.mobile, email: player.email ?? null, dateOfBirth: player.dateOfBirth ?? null } : base;
  }
  async getPlayerById(playerId: string, isAdmin: boolean): Promise<PlayerResponseDTO> {
    if (!Types.ObjectId.isValid(playerId)) throw new AppError("Invalid player ID", 400, "INVALID_ID");
    const player = await this.playerRepository.findPlayerPopulated(playerId);
    if (!player || (!isAdmin && player.status !== "active")) throw new AppError("Player not found", 404, "NOT_FOUND");
    return this.mapPlayerResponse(player, isAdmin);
  }
  async createPlayer(data: PlayerCreateInput): Promise<PlayerAdminDTO> {
    const settings = await this.settingsService.get();
    const mobile = normalizeMobile(data.mobile); const email = normalizeEmail(data.email);
    if (await this.playerRepository.findByMobile(mobile)) throw new AppError("Mobile already exists", 409, "DUPLICATE_MOBILE", { mobile: "Mobile already exists" });
    if (email && await this.playerRepository.findOne({ email })) throw new AppError("Email already exists", 409, "DUPLICATE_EMAIL", { email: "Email already exists" });
    if (data.status !== "inactive" && await this.playerRepository.count({ status: "active" }) >= settings.maxActivePlayers) throw new AppError("Maximum active player limit reached", 422, "PLAYER_LIMIT");
    if (data.auctionStatus === "sold") {
      if (settings.auctionState !== "in_progress") throw new AppError("Start or reopen the auction before marking a player sold", 409, "AUCTION_NOT_IN_PROGRESS");
      if (!data.teamRef || !data.auctionPrice || data.auctionPrice <= 0) throw new AppError("A sold player requires a team and auction price", 422, "INVALID_SOLD_PLAYER");
      await this.validatePlayerAssignment(data.teamRef, "", data.auctionPrice, data.isIconPlayer ?? false, data.position, data.jerseyNo);
    }
    if (data.status !== "inactive" && data.auctionStatus !== "sold" && (data.teamRef || data.jerseyNo != null || (data.auctionPrice ?? 0) !== 0)) throw new AppError("Pending and unsold players cannot have a team, jersey number or auction price", 422, "INVALID_AUCTION_FIELDS");
    const createData = data.status === "inactive"
      ? { ...data, mobile, email, teamRef: null, jerseyNo: null, auctionPrice: 0, auctionStatus: "pending" as const }
      : { ...data, mobile, email, teamRef: data.auctionStatus === "sold" ? data.teamRef ?? null : null, jerseyNo: data.auctionStatus === "sold" ? data.jerseyNo ?? null : null, auctionPrice: data.auctionStatus === "sold" ? data.auctionPrice ?? 0 : 0 };
    const created = await this.playerRepository.create(createData);
    const response = await this.getPlayerById(String(created._id), true);
    if (!("mobile" in response)) throw new AppError("Unable to create player", 500, "PLAYER_RESPONSE_ERROR");
    return response;
  }
  async updatePlayer(playerId: string, data: PlayerUpdateInput): Promise<PlayerAdminDTO> {
    const current = await this.playerRepository.findById(playerId);
    if (!current) throw new AppError("Player not found", 404, "NOT_FOUND");
    const mobile = data.mobile ? normalizeMobile(data.mobile) : current.mobile;
    const email = "email" in data ? normalizeEmail(data.email) : current.email;
    if (data.mobile && mobile !== current.mobile && await this.playerRepository.findByMobile(mobile)) throw new AppError("Mobile already exists", 409, "DUPLICATE_MOBILE", { mobile: "Mobile already exists" });
    if (email && email !== current.email && await this.playerRepository.findOne({ email, _id: { $ne: playerId } })) throw new AppError("Email already exists", 409, "DUPLICATE_EMAIL", { email: "Email already exists" });
    if (data.status === "inactive") return this.deactivatePlayer(playerId);
    const settings = await this.settingsService.get();
    const assignmentChanged = ["teamRef", "jerseyNo", "auctionPrice", "auctionStatus", "isIconPlayer", "position", "status"].some((key) => key in data);
    if (settings.auctionState === "completed" && assignmentChanged) throw new AppError("Reopen the auction before changing auction-related player data", 409, "AUCTION_COMPLETED");
    const merged = { ...current, ...data };
    if (merged.auctionStatus === "sold") {
      if (!merged.teamRef || merged.auctionPrice <= 0) throw new AppError("A sold player requires a team and auction price", 422, "INVALID_SOLD_PLAYER");
      if (assignmentChanged) await this.validatePlayerAssignment(String(merged.teamRef), playerId, merged.auctionPrice, merged.isIconPlayer, merged.position, merged.jerseyNo);
    } else { merged.teamRef = null; merged.jerseyNo = null; merged.auctionPrice = 0; }
    const updateData = { ...data, ...(data.mobile ? { mobile } : {}), ...("email" in data ? { email } : {}), ...(merged.auctionStatus !== "sold" ? { teamRef: null, jerseyNo: null, auctionPrice: 0 } : {}) };
    const updated = await this.playerRepository.update(playerId, updateData);
    if (!updated) throw new AppError("Player not found", 404, "NOT_FOUND");
    const response = await this.getPlayerById(playerId, true);
    if (!("mobile" in response)) throw new AppError("Unable to update player", 500, "PLAYER_RESPONSE_ERROR");
    return response;
  }
  private async validatePlayerAssignment(teamId: string, playerId: string, price: number, isIconPlayer: boolean, position: PlayerPosition, jerseyNo?: number | null): Promise<void> {
    const team = await this.teamRepository.findById(teamId);
    if (!team || team.status !== "active") throw new AppError("Select an active team", 422, "INVALID_TEAM");
    const settings = await this.settingsService.get(); const squad = await this.playerRepository.getTeamPlayers(teamId);
    const existing = squad.filter((player) => String(player._id) !== playerId);
    if (existing.length >= settings.maxPlayersPerTeam) throw new AppError("Team squad limit reached", 422, "SQUAD_LIMIT");
    if (existing.reduce((total, player) => total + player.auctionPrice, 0) + price > settings.auctionBudgetPerTeam) throw new AppError("Team auction budget exceeded", 422, "BUDGET_EXCEEDED");
    if (isIconPlayer && existing.some((player) => player.isIconPlayer)) throw new AppError("Team already has an icon player", 422, "ICON_LIMIT");
    if (position === "GK" && existing.some((player) => player.position === "GK")) throw new AppError("Team already has a goalkeeper", 422, "GOALKEEPER_LIMIT");
    if (jerseyNo != null && await this.playerRepository.findDuplicateJersey(teamId, jerseyNo, playerId || undefined)) throw new AppError("Jersey number already used in this team", 409, "DUPLICATE_JERSEY", { jerseyNo: "Jersey number already used in this team" });
  }
  async assignPlayerToTeam(playerId: string, data: AssignPlayerInput): Promise<PlayerAdminDTO> {
    const player = await this.playerRepository.findById(playerId);
    if (!player || player.status !== "active") throw new AppError("Active player not found", 404, "PLAYER_NOT_FOUND");
    if ((await this.settingsService.get()).auctionState !== "in_progress") throw new AppError("Start or reopen the auction before making assignments", 409, "AUCTION_NOT_IN_PROGRESS");
    await this.validatePlayerAssignment(data.teamRef, playerId, data.auctionPrice, player.isIconPlayer, player.position, data.jerseyNo);
    const updated = await this.playerRepository.update(playerId, { teamRef: data.teamRef, auctionPrice: data.auctionPrice, jerseyNo: data.jerseyNo ?? null, auctionStatus: "sold" });
    if (!updated) throw new AppError("Player not found", 404, "NOT_FOUND");
    const response = await this.getPlayerById(playerId, true);
    if (!("mobile" in response)) throw new AppError("Unable to assign player", 500, "PLAYER_RESPONSE_ERROR");
    return response;
  }
  async markPlayerUnsold(playerId: string): Promise<PlayerAdminDTO> {
    if ((await this.settingsService.get()).auctionState !== "in_progress") throw new AppError("Start or reopen the auction before changing auction results", 409, "AUCTION_NOT_IN_PROGRESS");
    const updated = await this.playerRepository.update(playerId, { teamRef: null, jerseyNo: null, auctionPrice: 0, auctionStatus: "unsold" });
    if (!updated) throw new AppError("Player not found", 404, "NOT_FOUND");
    const response = await this.getPlayerById(playerId, true);
    if (!("mobile" in response)) throw new AppError("Unable to mark player unsold", 500, "PLAYER_RESPONSE_ERROR");
    return response;
  }
  async deactivatePlayer(playerId: string): Promise<PlayerAdminDTO> {
    if (!await this.playerRepository.findById(playerId)) throw new AppError("Player not found", 404, "NOT_FOUND");
    if ((await this.settingsService.get()).auctionState === "completed") await this.settingsService.updateSettings({ auctionState: "in_progress", auctionCompletedAt: null });
    const updated = await this.playerRepository.update(playerId, { status: "inactive", teamRef: null, jerseyNo: null, auctionPrice: 0, auctionStatus: "pending" });
    if (!updated) throw new AppError("Player not found", 404, "NOT_FOUND");
    const response = await this.getPlayerById(playerId, true);
    if (!("mobile" in response)) throw new AppError("Unable to deactivate player", 500, "PLAYER_RESPONSE_ERROR");
    return response;
  }
  async deletePlayer(playerId: string): Promise<void> {
    if (!await this.playerRepository.findById(playerId)) throw new AppError("Player not found", 404, "NOT_FOUND");
    if (await this.playerRepository.countGoalReferences(playerId)) throw new AppError("Player is referenced by match goals. Deactivate instead.", 409, "PLAYER_REFERENCED");
    if (!await this.playerRepository.remove(playerId)) throw new AppError("Player not found", 404, "NOT_FOUND");
  }
}
