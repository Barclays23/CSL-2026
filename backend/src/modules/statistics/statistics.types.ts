import type { PlayerPublicDTO } from "../players/player.types.js";
import type { TeamBriefDTO } from "../teams/team.types.js";
import type { MatchRecord } from "../matches/match.model.js";

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
  startDate: Date;
  endDate: Date;
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
  mostCleanSheets: NamedTeamCountDTO[];
  upcomingFixtures: MatchRecord[];
  recentResults: MatchRecord[];
  alerts: string[];
}

export interface TeamStatisticsDTO {
  team: TeamBriefDTO;
  group: Omit<StandingRowDTO, "position" | "team" | "qualified">;
  overall: {
    played: number;
    goalsFor: number;
    goalsAgainst: number;
    cleanSheets: number;
  };
}
