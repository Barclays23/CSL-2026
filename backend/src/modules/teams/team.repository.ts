import { Types, type QueryFilter } from "mongoose";
import { TeamModel } from "./team.model.js";
import type { TeamRecord } from "./team.model.js";
import { PlayerModel } from "../players/player.model.js";
import { ManagerModel } from "../managers/manager.model.js";
import { MatchModel } from "../matches/match.model.js";
import type {
  TeamCreateDTO,
  TeamEntity,
  TeamFields,
  TeamListFilter,
  TeamReferenceCounts,
  ITeamRepository,
  TeamUpdateDTO,
} from "./team.types.js";

export class TeamRepository implements ITeamRepository {
  async findTeams(
    filter: TeamListFilter,
    page: number,
    limit: number,
  ): Promise<{ items: TeamEntity[]; total: number }> {
    const mongoFilter: QueryFilter<TeamRecord> = filter;
    const [items, total] = await Promise.all([
      TeamModel.find(mongoFilter)
        .sort({ name: 1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean<TeamEntity[]>()
        .exec(),
      TeamModel.countDocuments(mongoFilter).exec(),
    ]);
    return { items, total };
  }

  async findTeamById(teamId: string): Promise<TeamEntity | null> {
    return TeamModel.findById(teamId).lean<TeamEntity>().exec();
  }

  async findTeamByName(name: string): Promise<TeamEntity | null> {
    return TeamModel.findOne({ name: { $regex: "^" + this.escapeRegex(name) + "$", $options: "i" } })
      .lean<TeamEntity>()
      .exec();
  }

  async countActiveTeams(): Promise<number> {
    return TeamModel.countDocuments({ status: "active" }).exec();
  }

  async findTeamReferenceCounts(teamId: string): Promise<TeamReferenceCounts> {
    const objectId = new Types.ObjectId(teamId);
    const [players, managers, matches] = await Promise.all([
      PlayerModel.countDocuments({ teamRef: objectId }).exec(),
      ManagerModel.countDocuments({ teamRef: objectId }).exec(),
      MatchModel.countDocuments({ $or: [{ team1Ref: objectId }, { team2Ref: objectId }] }).exec(),
    ]);
    return { players, managers, matches };
  }

  async createTeam(data: TeamCreateDTO): Promise<TeamEntity> {
    const fields: TeamFields = {
      name: data.name.trim(),
      shortName: data.shortName?.trim() || null,
      logo: data.logo ?? null,
      poster: data.poster ?? null,
      groupName: data.groupName?.trim() || null,
      status: data.status,
    };
    const createdTeam = await TeamModel.create(fields);
    const savedTeam = await this.findTeamById(String(createdTeam._id));
    if (!savedTeam) throw new Error("Created team could not be retrieved");
    return savedTeam;
  }

  async updateTeam(teamId: string, data: TeamUpdateDTO): Promise<TeamEntity | null> {
    const updateFields: Partial<TeamFields> = {};
    if (data.name !== undefined) updateFields.name = data.name.trim();
    if (data.shortName !== undefined) updateFields.shortName = data.shortName?.trim() || null;
    if (data.logo !== undefined) updateFields.logo = data.logo;
    if (data.poster !== undefined) updateFields.poster = data.poster;
    if (data.groupName !== undefined) updateFields.groupName = data.groupName?.trim() || null;
    if (data.status !== undefined) updateFields.status = data.status;
    return TeamModel.findByIdAndUpdate(teamId, { $set: updateFields }, {
      new: true,
      runValidators: true,
    }).lean<TeamEntity>().exec();
  }

  async deleteTeam(teamId: string): Promise<boolean> {
    const deletedTeam = await TeamModel.findByIdAndDelete(teamId).select("_id").lean().exec();
    return deletedTeam !== null;
  }

  private escapeRegex(value: string): string {
    return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }
}
