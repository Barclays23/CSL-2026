import type { GroupStandingDTO, TopScorerDTO, DashboardSummaryDTO, OverallTeamStatisticsDTO, TeamStatisticsDTO } from "./statistics.types.js";
import type { MatchEntity, MatchResponseDTO, PopulatedMatchEntity } from "../matches/match.types.js";
import type { PlayerPublicDTO, PlayerStatisticsEntity } from "../players/player.types.js";
import type { TeamBriefDTO, TeamEntity } from "../teams/team.types.js";

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
export interface IStatisticsService {
  getDashboardStatistics(): Promise<DashboardSummaryDTO>;
  getGroupStandings(): Promise<GroupStandingDTO[]>;
  getTopScorers(): Promise<TopScorerDTO[]>;
  getOverallTeamStatistics(): Promise<OverallTeamStatisticsDTO[]>;
  getTeamStatistics(teamId: string): Promise<TeamStatisticsDTO>;
}
export interface IStatisticsController {
  getDashboardStatistics: import("../../shared/types/common.types.js").ControllerMethod;
  getGroupStandings: import("../../shared/types/common.types.js").ControllerMethod;
  getTopScorers: import("../../shared/types/common.types.js").ControllerMethod;
}
