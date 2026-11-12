import type { MatchResponseDTO } from "../matches/match.types.js";
import type { PlayerPublicDTO } from "../players/player.types.js";
import type { TeamBriefDTO } from "../teams/team.types.js";

export interface StandingRowDTO {
  position: number;
  team: TeamBriefDTO;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
  qualified: boolean;
}

export interface GroupStandingDTO {
  groupName: string;
  rows: StandingRowDTO[];
}

export interface TopScorerDTO {
  rank: number;
  player: PlayerPublicDTO;
  team: TeamBriefDTO | null;
  goals: number;
}

export interface NamedTeamCountDTO {
  team: TeamBriefDTO;
  goals?: number;
  cleanSheets?: number;
}

export interface DashboardSummaryDTO {
  tournamentName: string;
  startDate: string;
  endDate: string;
  totalMatchesPlayed: number;
  totalGoals: number;
  activeTeams: number;
  activePlayers: number;
  pendingPlayers: number;
  soldPlayers: number;
  unsoldPlayers: number;
  totalAuctionSpend: number;
  upcomingMatchCount: number;
  topScorer: TopScorerDTO | null;
  mostScoringTeam: { team: TeamBriefDTO; goals: number } | null;
  mostConcedingTeam: { team: TeamBriefDTO; goals: number } | null;
  mostCleanSheets: { team: TeamBriefDTO; cleanSheets: number }[];
  upcomingFixtures: MatchResponseDTO[];
  recentResults: MatchResponseDTO[];
  alerts: string[];
}

export interface OverallTeamStatisticsDTO {
  team: TeamBriefDTO;
  played: number;
  goalsFor: number;
  goalsAgainst: number;
  cleanSheets: number;
}

export interface TeamStatisticsDTO {
  team: TeamBriefDTO;
  group: {
    played: number;
    won: number;
    drawn: number;
    lost: number;
    goalsFor: number;
    goalsAgainst: number;
    goalDifference: number;
    points: number;
  };
  overall: {
    played: number;
    goalsFor: number;
    goalsAgainst: number;
    cleanSheets: number;
  };
}

export interface IStatisticsService {
  getDashboardStatistics(): Promise<DashboardSummaryDTO>;
  getGroupStandings(): Promise<GroupStandingDTO[]>;
  getTopScorers(): Promise<TopScorerDTO[]>;
  getOverallTeamStatistics(): Promise<OverallTeamStatisticsDTO[]>;
  getTeamStatistics(teamId: string): Promise<TeamStatisticsDTO>;
}

export interface IStatisticsController {
  getDashboardStatistics: import("express").RequestHandler;
  getGroupStandings: import("express").RequestHandler;
  getTopScorers: import("express").RequestHandler;
}
