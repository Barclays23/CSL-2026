import { Types, type QueryFilter } from "mongoose";
import { TeamModel, type TeamRecord } from "./team.model.js";
import { PlayerModel } from "../players/player.model.js";
import { ManagerModel } from "../managers/manager.model.js";
import { MatchModel } from "../matches/match.model.js";
export class TeamRepository {
  async findById(teamId: string): Promise<(TeamRecord & { _id: Types.ObjectId }) | null> { return TeamModel.findById(teamId).lean().exec() as Promise<(TeamRecord & { _id: Types.ObjectId }) | null>; }
  async findByName(name: string): Promise<(TeamRecord & { _id: Types.ObjectId }) | null> {
    const escapedName = name.replace(/[.*+?^$()|[\]\\]/g, "\\$&");
    return TeamModel.findOne({ name: { $regex: `^${escapedName}$`, $options: "i" } }).lean().exec() as Promise<(TeamRecord & { _id: Types.ObjectId }) | null>;
  }
  async list(filter: QueryFilter<TeamRecord>, page = 1, limit = 50, sort: Record<string, 1 | -1> = { name: 1 }): Promise<{ items: Array<TeamRecord & { _id: Types.ObjectId }>; total: number }> {
    const [items, total] = await Promise.all([TeamModel.find(filter).sort(sort).skip((page - 1) * limit).limit(limit).lean().exec(), TeamModel.countDocuments(filter).exec()]);
    return { items: items as Array<TeamRecord & { _id: Types.ObjectId }>, total };
  }
  async count(filter: QueryFilter<TeamRecord> = {}): Promise<number> { return TeamModel.countDocuments(filter).exec(); }
  async countActive(): Promise<number> { return this.count({ status: "active" }); }
  async create(data: Partial<TeamRecord>): Promise<TeamRecord & { _id: Types.ObjectId }> { const created = await TeamModel.create(data); return created.toObject() as TeamRecord & { _id: Types.ObjectId }; }
  async update(teamId: string, data: Partial<TeamRecord>): Promise<(TeamRecord & { _id: Types.ObjectId }) | null> { return TeamModel.findByIdAndUpdate(teamId, { $set: data }, { new: true, runValidators: true }).lean().exec() as Promise<(TeamRecord & { _id: Types.ObjectId }) | null>; }
  async remove(teamId: string): Promise<boolean> { return (await TeamModel.findByIdAndDelete(teamId).select("_id").lean().exec()) !== null; }
  async findReferenced(teamId: string): Promise<{ players: number; matches: number; managers: number }> {
    const teamObjectId = new Types.ObjectId(teamId);
    const [players, matches, managers] = await Promise.all([PlayerModel.countDocuments({ teamRef: teamObjectId }), MatchModel.countDocuments({ $or: [{ team1Ref: teamObjectId }, { team2Ref: teamObjectId }] }), ManagerModel.countDocuments({ teamRef: teamObjectId })]);
    return { players, matches, managers };
  }
}
