import { Types, type QueryFilter } from "mongoose";
import { MatchModel } from "../matches/match.model.js";
import { PlayerModel } from "./player.model.js";
import type { PlayerRecord } from "./player.model.js";
import type { IPlayerRepository } from "./player.interfaces.js";
import type { PlayerAuctionCountsDTO, PlayerEntity, PlayerFields, PlayerListFilter, PopulatedPlayerEntity } from "./player.types.js";

interface AuctionSpendAggregationResult {
  _id: null;
  totalAmount: number;
}

export class PlayerRepository implements IPlayerRepository {
  async findPlayers(
    filter: PlayerListFilter,
    page: number,
    limit: number,
  ): Promise<{ items: PopulatedPlayerEntity[]; total: number }> {
    const mongoFilter: QueryFilter<PlayerRecord> = filter;
    const [items, total] = await Promise.all([
      PlayerModel.find(mongoFilter)
        .sort({ name: 1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .populate({ path: "teamRef", select: "name shortName logo groupName" })
        .lean<PopulatedPlayerEntity[]>()
        .exec(),
      PlayerModel.countDocuments(mongoFilter).exec(),
    ]);
    return { items, total };
  }

  async findPlayerById(playerId: string): Promise<PlayerEntity | null> {
    return PlayerModel.findById(playerId).lean<PlayerEntity>().exec();
  }

  async findPlayerWithTeamById(playerId: string): Promise<PopulatedPlayerEntity | null> {
    return PlayerModel.findById(playerId)
      .populate({ path: "teamRef", select: "name shortName logo groupName" })
      .lean<PopulatedPlayerEntity>()
      .exec();
  }

  async findPlayerByMobile(mobile: string): Promise<PlayerEntity | null> {
    return PlayerModel.findOne({ mobile }).lean<PlayerEntity>().exec();
  }

  async findPlayerByEmail(email: string): Promise<PlayerEntity | null> {
    return PlayerModel.findOne({ email }).lean<PlayerEntity>().exec();
  }

  async findPlayerWithJerseyNumber(
    teamId: string,
    jerseyNo: number,
    excludePlayerId?: string,
  ): Promise<PlayerEntity | null> {
    const filter: QueryFilter<PlayerRecord> = {
      teamRef: new Types.ObjectId(teamId),
      jerseyNo,
      ...(excludePlayerId ? { _id: { $ne: new Types.ObjectId(excludePlayerId) } } : {}),
    };
    return PlayerModel.findOne(filter).lean<PlayerEntity>().exec();
  }

  async findSoldPlayersByTeam(teamId: string): Promise<PlayerEntity[]> {
    return PlayerModel.find({
      teamRef: new Types.ObjectId(teamId),
      status: "active",
      auctionStatus: "sold",
    }).sort({ name: 1 }).lean<PlayerEntity[]>().exec();
  }

  async countPlayers(
    filter: Partial<Pick<PlayerFields, "status" | "auctionStatus">>,
  ): Promise<number> {
    return PlayerModel.countDocuments(filter).exec();
  }

  async countPlayerGoalReferences(playerId: string): Promise<number> {
    const [normalGoalReferences, ownGoalReferences] = await Promise.all([
      MatchModel.countDocuments({ "goals.scorerRef": new Types.ObjectId(playerId) }).exec(),
      MatchModel.countDocuments({ "goals.ownGoalPlayerRef": new Types.ObjectId(playerId) }).exec(),
    ]);
    return normalGoalReferences + ownGoalReferences;
  }

  async getPlayerAuctionCounts(): Promise<PlayerAuctionCountsDTO> {
    const [activeAuctionPlayers, pendingPlayers, soldPlayers, unsoldPlayers, spendRows] = await Promise.all([
      this.countPlayers({ status: "active" }),
      this.countPlayers({ status: "active", auctionStatus: "pending" }),
      this.countPlayers({ status: "active", auctionStatus: "sold" }),
      this.countPlayers({ status: "active", auctionStatus: "unsold" }),
      PlayerModel.aggregate<AuctionSpendAggregationResult>([
        { $match: { status: "active", auctionStatus: "sold" } },
        { $group: { _id: null, totalAmount: { $sum: "$auctionPrice" } } },
      ]).exec(),
    ]);

    return {
      activeAuctionPlayers,
      pendingPlayers,
      soldPlayers,
      unsoldPlayers,
      totalAuctionSpend: spendRows[0]?.totalAmount ?? 0,
    };
  }

  async countInvalidSoldPlayers(): Promise<number> {
    return PlayerModel.countDocuments({
      status: "active",
      auctionStatus: "sold",
      $or: [{ teamRef: null }, { auctionPrice: { $lte: 0 } }],
    }).exec();
  }

  async createPlayer(data: PlayerFields): Promise<PlayerEntity> {
    const createdPlayer = await PlayerModel.create(data);
    const savedPlayer = await this.findPlayerById(String(createdPlayer._id));
    if (!savedPlayer) throw new Error("Created player could not be retrieved");
    return savedPlayer;
  }

  async updatePlayer(playerId: string, data: Partial<PlayerFields>): Promise<PlayerEntity | null> {
    return PlayerModel.findByIdAndUpdate(playerId, { $set: data }, {
      returnDocument: "after",
      runValidators: true,
    }).lean<PlayerEntity>().exec();
  }

  async deletePlayer(playerId: string): Promise<boolean> {
    const deletedPlayer = await PlayerModel.findByIdAndDelete(playerId).select("_id").lean().exec();
    return deletedPlayer !== null;
  }
}
