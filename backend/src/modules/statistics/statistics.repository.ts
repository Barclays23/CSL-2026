import { MatchModel } from "../matches/match.model.js";
import type { MatchEntity, PopulatedMatchEntity } from "../matches/match.types.js";
import { PlayerModel } from "../players/player.model.js";
import type { PlayerStatisticsEntity } from "../players/player.types.js";
import { TeamModel } from "../teams/team.model.js";
import type { TeamEntity } from "../teams/team.types.js";

const populatedFixturePaths = [
  { path: "team1Ref", select: "name shortName logo groupName" },
  { path: "team2Ref", select: "name shortName logo groupName" },
  { path: "goals.scoringTeamRef", select: "name shortName logo groupName" },
  { path: "goals.scorerRef", select: "name position jerseyNo profilePic teamRef" },
  { path: "goals.ownGoalPlayerRef", select: "name position jerseyNo profilePic teamRef" },
];

export interface IStatisticsRepository {
  findCompletedMatches(): Promise<MatchEntity[]>;
  findCompletedGroupStageMatches(): Promise<MatchEntity[]>;
  findAllTeams(): Promise<TeamEntity[]>;
  findActiveTeams(): Promise<TeamEntity[]>;
  findPlayersForTournamentStatistics(): Promise<PlayerStatisticsEntity[]>;
  findUpcomingFixtureCards(limit: number): Promise<PopulatedMatchEntity[]>;
  findRecentResultCards(limit: number): Promise<PopulatedMatchEntity[]>;
  countScheduledFixtures(): Promise<number>;
}

export class StatisticsRepository implements IStatisticsRepository {
  async findCompletedMatches(): Promise<MatchEntity[]> {
    return MatchModel.find({ status: "completed" })
      .sort({ kickoffAt: 1 })
      .lean<MatchEntity[]>()
      .exec();
  }

  async findCompletedGroupStageMatches(): Promise<MatchEntity[]> {
    return MatchModel.find({ status: "completed", stage: "group" })
      .sort({ kickoffAt: 1 })
      .lean<MatchEntity[]>()
      .exec();
  }

  async findAllTeams(): Promise<TeamEntity[]> {
    return TeamModel.find().sort({ name: 1 }).lean<TeamEntity[]>().exec();
  }

  async findActiveTeams(): Promise<TeamEntity[]> {
    return TeamModel.find({ status: "active" }).sort({ name: 1 }).lean<TeamEntity[]>().exec();
  }

  async findPlayersForTournamentStatistics(): Promise<PlayerStatisticsEntity[]> {
    return PlayerModel.find()
      .select("name position isIconPlayer teamRef jerseyNo auctionPrice auctionStatus status profilePic")
      .sort({ name: 1 })
      .lean<PlayerStatisticsEntity[]>()
      .exec();
  }

  async findUpcomingFixtureCards(limit: number): Promise<PopulatedMatchEntity[]> {
    return MatchModel.find({ status: "scheduled" })
      .sort({ kickoffAt: 1 })
      .limit(limit)
      .populate(populatedFixturePaths)
      .lean<PopulatedMatchEntity[]>()
      .exec();
  }

  async findRecentResultCards(limit: number): Promise<PopulatedMatchEntity[]> {
    return MatchModel.find({ status: "completed" })
      .sort({ kickoffAt: -1 })
      .limit(limit)
      .populate(populatedFixturePaths)
      .lean<PopulatedMatchEntity[]>()
      .exec();
  }

  async countScheduledFixtures(): Promise<number> {
    return MatchModel.countDocuments({ status: "scheduled" }).exec();
  }
}
