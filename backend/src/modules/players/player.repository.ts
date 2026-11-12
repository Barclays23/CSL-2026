import type { FilterQuery, Types } from "mongoose";
import { MatchModel } from "../matches/match.model.js";
import { PlayerModel, type PlayerRecord } from "./player.model.js";
import type { PlayerFilter, PlayerListRecord } from "./player.types.js";

export class PlayerRepository {
  async listPlayers(filter: PlayerFilter, page: number, limit: number): Promise<{ items: PlayerListRecord[]; total: number }> {
    const mongoFilter: FilterQuery<PlayerRecord> = filter;
    const [items, total] = await Promise.all([
      PlayerModel.find(mongoFilter).sort({ name: 1 }).skip((page - 1) * limit).limit(limit)
        .populate({ path: "teamRef", select: "name shortName logo groupName" }).lean<PlayerListRecord[]>().exec(),
      PlayerModel.countDocuments(mongoFilter).exec(),
    ]);
    return { items, total };
  }
  async findPlayerPopulated(playerId: string): Promise<PlayerListRecord | null> {
    return PlayerModel.findById(playerId).populate({ path: "teamRef", select: "name shortName logo groupName" }).lean<PlayerListRecord>().exec();
  }
  async findById(playerId: string): Promise<PlayerRecord & { _id: Types.ObjectId } | null> {
    return PlayerModel.findById(playerId).lean().exec() as Promise<(PlayerRecord & { _id: Types.ObjectId }) | null>;
  }
  async findOne(filter: FilterQuery<PlayerRecord>): Promise<(PlayerRecord & { _id: Types.ObjectId }) | null> {
    return PlayerModel.findOne(filter).lean().exec() as Promise<(PlayerRecord & { _id: Types.ObjectId }) | null>;
  }
  async findByMobile(mobile: string): Promise<(PlayerRecord & { _id: Types.ObjectId }) | null> {
    return this.findOne({ mobile });
  }
  async findDuplicateJersey(teamRef: string, jerseyNo: number, excludeId?: string): Promise<boolean> {
    const filter: FilterQuery<PlayerRecord> = { teamRef: teamRef as unknown as Types.ObjectId, jerseyNo, ...(excludeId ? { _id: { $ne: excludeId } } : {}) };
    return PlayerModel.exists(filter).then((result) => result !== null);
  }
  async getTeamPlayers(teamRef: string): Promise<Array<PlayerRecord & { _id: Types.ObjectId }>> {
    return PlayerModel.find({ teamRef, status: "active", auctionStatus: "sold" }).sort({ name: 1 }).lean().exec() as Promise<Array<PlayerRecord & { _id: Types.ObjectId }>>;
  }
  async count(filter: FilterQuery<PlayerRecord> = {}): Promise<number> { return PlayerModel.countDocuments(filter).exec(); }
  async create(data: Partial<PlayerRecord>): Promise<PlayerRecord & { _id: Types.ObjectId }> {
    const document = await PlayerModel.create(data);
    return document.toObject() as PlayerRecord & { _id: Types.ObjectId };
  }
  async update(playerId: string, data: Partial<PlayerRecord>): Promise<(PlayerRecord & { _id: Types.ObjectId }) | null> {
    return PlayerModel.findByIdAndUpdate(playerId, { $set: data }, { new: true, runValidators: true }).lean().exec() as Promise<(PlayerRecord & { _id: Types.ObjectId }) | null>;
  }
  async remove(playerId: string): Promise<boolean> {
    const result = await PlayerModel.findByIdAndDelete(playerId).select("_id").lean().exec();
    return result !== null;
  }
  async countGoalReferences(playerId: string): Promise<number> {
    const [normalGoals, ownGoals] = await Promise.all([
      MatchModel.countDocuments({ "goals.scorerRef": playerId }).exec(),
      MatchModel.countDocuments({ "goals.ownGoalPlayerRef": playerId }).exec(),
    ]);
    return normalGoals + ownGoals;
  }
  async auctionCounts(): Promise<{ activeAuctionPlayers: number; pendingPlayers: number; soldPlayers: number; unsoldPlayers: number; totalAuctionSpend: number }> {
    const [activeAuctionPlayers, pendingPlayers, soldPlayers, unsoldPlayers, spend] = await Promise.all([
      this.count({ status: "active" }), this.count({ status: "active", auctionStatus: "pending" }),
      this.count({ status: "active", auctionStatus: "sold" }), this.count({ status: "active", auctionStatus: "unsold" }),
      PlayerModel.aggregate<{ total: number }>([{ $match: { status: "active", auctionStatus: "sold" } }, { $group: { _id: null, total: { $sum: "$auctionPrice" } } }]).exec(),
    ]);
    return { activeAuctionPlayers, pendingPlayers, soldPlayers, unsoldPlayers, totalAuctionSpend: spend[0]?.total ?? 0 };
  }
  async invalidSoldCount(): Promise<number> {
    return this.count({ status: "active", auctionStatus: "sold", $or: [{ teamRef: null }, { auctionPrice: { $lte: 0 } }] });
  }
}
