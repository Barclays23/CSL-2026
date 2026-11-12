import type { FilterQuery, Types } from "mongoose";
import { TeamModel, type TeamRecord } from "./team.model.js";
import { PlayerModel } from "../players/player.model.js";
import { ManagerModel } from "../managers/manager.model.js";
import { MatchModel } from "../matches/match.model.js";

export class TeamRepository {
  async findById(teamId: string): Promise<(TeamRecord & { _id: Types.ObjectId }) | null> {
    return TeamModel.findById(teamId).lean().exec() as Promise<(TeamRecord & { _id: Types.ObjectId }) | null>;
  }
  async findByName(name: string): Promise<(TeamRecord & { _id: Types.ObjectId }) | null> {
    return TeamModel.findOne({ name: { $regex: "^" + name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "$", $options: "i" } }).lean().exec() as Promise<(TeamRecord & { _id: Types.ObjectId }) | null>;
  }
  async list(filter: FilterQuery<TeamRecord>, page = 1, limit = 50, sort: Record<string, 1 | -1> = { name: 1 }): Promise<{ items: Array<TeamRecord & { _id: Types.ObjectId }>; total: number }> {
    const [items, total] = await Promise.all([
      TeamModel.find(filter).sort(sort).skip((page - 1) * limit).limit(limit).lean().exec() as Promise<Array<TeamRecord & { _id: Types.ObjectId }>>,
      TeamModel.countDocuments(filter).exec(),
    ]);
    return { items, total };
  }
  async count(filter: FilterQuery<TeamRecord> = {}): Promise<number> { return TeamModel.countDocuments(filter).exec(); }
  async countActive(): Promise<number> { return this.count({ status: "active" }); }
  async create(data: Partial<TeamRecord>): Promise<TeamRecord & { _id: Types.ObjectId }> {
    const created = await TeamModel.create(data);
    return created.toObject() as TeamRecord & { _id: Types.ObjectId };
  }
  async update(teamId: string, data: Partial<TeamRecord>): Promise<(TeamRecord & { _id: Types.ObjectId }) | null> {
    return TeamModel.findByIdAndUpdate(teamId, { $set: data }, { new: true, runValidators: true }).lean().exec() as Promise<(TeamRecord & { _id: Types.ObjectId }) | null>;
  }
  async remove(teamId: string): Promise<boolean> {
    const deleted = await TeamModel.findByIdAndDelete(teamId).select("_id").lean().exec();
    return deleted !== null;
  }
  async findReferenced(teamId: string): Promise<{ players: number; matches: number; managers: number }> {
    const [players, matches, managers] = await Promise.all([
      PlayerModel.countDocuments({ teamRef: teamId }), MatchModel.countDocuments({ $or: [{ team1Ref: teamId }, { team2Ref: teamId }] }),
      ManagerModel.countDocuments({ teamRef: teamId }),
    ]);
    return { players, matches, managers };
  }
}
