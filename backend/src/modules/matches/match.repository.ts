import { Types, type QueryFilter } from "mongoose";
import { MatchModel } from "./match.model.js";
import type { MatchRecord } from "./match.model.js";
import type { IMatchRepository } from "./match.interfaces.js";
import type { GoalFields, MatchEntity, MatchFields, MatchListFilter, PopulatedMatchEntity } from "./match.types.js";

const populatedMatchPaths = [
  { path: "team1Ref", select: "name shortName logo groupName" },
  { path: "team2Ref", select: "name shortName logo groupName" },
  { path: "goals.scoringTeamRef", select: "name shortName logo groupName" },
  { path: "goals.scorerRef", select: "name position jerseyNo profilePic teamRef" },
  { path: "goals.ownGoalPlayerRef", select: "name position jerseyNo profilePic teamRef" },
];

export class MatchRepository implements IMatchRepository {
  async findMatches(
    filter: MatchListFilter,
    page: number,
    limit: number,
  ): Promise<{ items: PopulatedMatchEntity[]; total: number }> {
    const mongoFilter: QueryFilter<MatchRecord> = filter;
    const [items, total] = await Promise.all([
      MatchModel.find(mongoFilter)
        .sort({ kickoffAt: 1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .populate(populatedMatchPaths)
        .lean<PopulatedMatchEntity[]>()
        .exec(),
      MatchModel.countDocuments(mongoFilter).exec(),
    ]);
    return { items, total };
  }

  async findMatchById(matchId: string): Promise<MatchEntity | null> {
    return MatchModel.findById(matchId).lean<MatchEntity>().exec();
  }

  async findMatchWithTeamsAndGoals(matchId: string): Promise<PopulatedMatchEntity | null> {
    return MatchModel.findById(matchId)
      .populate(populatedMatchPaths)
      .lean<PopulatedMatchEntity>()
      .exec();
  }

  async findMatchByNumber(matchNo: string): Promise<MatchEntity | null> {
    return MatchModel.findOne({ matchNo }).lean<MatchEntity>().exec();
  }

  async createMatch(data: MatchFields): Promise<MatchEntity> {
    const createdMatch = await MatchModel.create(data);
    const savedMatch = await this.findMatchById(String(createdMatch._id));
    if (!savedMatch) throw new Error("Created match could not be retrieved");
    return savedMatch;
  }

  async updateMatch(matchId: string, data: Partial<MatchFields>): Promise<MatchEntity | null> {
    return MatchModel.findByIdAndUpdate(matchId, { $set: data }, {
      new: true,
      runValidators: true,
    }).lean<MatchEntity>().exec();
  }

  async deleteMatch(matchId: string): Promise<boolean> {
    const deletedMatch = await MatchModel.findByIdAndDelete(matchId).select("_id").lean().exec();
    return deletedMatch !== null;
  }

  async appendGoal(matchId: string, goal: GoalFields): Promise<PopulatedMatchEntity | null> {
    return MatchModel.findByIdAndUpdate(
      matchId,
      { $push: { goals: goal } },
      { new: true, runValidators: true },
    ).populate(populatedMatchPaths).lean<PopulatedMatchEntity>().exec();
  }

  async updateMatchGoal(
    matchId: string,
    goalId: string,
    goal: GoalFields,
  ): Promise<PopulatedMatchEntity | null> {
    return MatchModel.findOneAndUpdate(
      { _id: matchId, "goals._id": new Types.ObjectId(goalId) },
      {
        $set: {
          "goals.$.scoringTeamRef": goal.scoringTeamRef,
          "goals.$.goalType": goal.goalType,
          "goals.$.scorerRef": goal.scorerRef,
          "goals.$.ownGoalPlayerRef": goal.ownGoalPlayerRef,
        },
      },
      { new: true, runValidators: true },
    ).populate(populatedMatchPaths).lean<PopulatedMatchEntity>().exec();
  }

  async removeMatchGoal(matchId: string, goalId: string): Promise<PopulatedMatchEntity | null> {
    return MatchModel.findByIdAndUpdate(
      matchId,
      { $pull: { goals: { _id: new Types.ObjectId(goalId) } } },
      { new: true },
    ).populate(populatedMatchPaths).lean<PopulatedMatchEntity>().exec();
  }
}
