import type { MatchEntity, MatchResponseDTO, PopulatedMatchEntity } from "../matches/match.types.js";
import type { PlayerPublicDTO, PlayerStatisticsEntity } from "../players/player.types.js";
import type { TeamBriefDTO, TeamEntity } from "../teams/team.types.js";

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

export type { IStatisticsRepository, IStatisticsService, IStatisticsController } from "./statistics.interfaces.js";
