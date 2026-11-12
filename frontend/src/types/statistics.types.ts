import type { Match } from "@/types/match.types";
import type { PublicPlayer } from "@/types/player.types";
import type { TeamBrief } from "@/types/team.types";

/**
 * Assumption (isolated here): standings rows include `qualified` for the
 * top two teams in each group. That is the current 6-team CSL format
 * (groups of three, top two advance). The order itself always comes from
 * the statistics API.
 */
export interface StandingRow {
  position: number;
  team: TeamBrief;
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

export interface GroupStanding {
  groupName: string;
  rows: StandingRow[];
}

export interface TopScorer {
  rank: number;
  player: PublicPlayer;
  team: TeamBrief | null;
  goals: number;
}

export interface NamedCount {
  team: TeamBrief;
  goals?: number;
  cleanSheets?: number;
}

export interface DashboardSummary {
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
  topScorer: TopScorer | null;
  mostScoringTeam: { team: TeamBrief; goals: number } | null;
  mostConcedingTeam: { team: TeamBrief; goals: number } | null;
  mostCleanSheets: { team: TeamBrief; cleanSheets: number }[];
  upcomingFixtures: Match[];
  recentResults: Match[];
  alerts: string[];
}

export interface TeamStatistics {
  team: TeamBrief;
  group: Omit<StandingRow, "position" | "team" | "qualified">;
  overall: {
    played: number;
    goalsFor: number;
    goalsAgainst: number;
    cleanSheets: number;
  };
}
