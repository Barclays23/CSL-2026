import type { TeamBriefDTO } from "../teams/team.types.js";
import type { PlayerPublicDTO } from "../players/player.types.js";
import type { MatchResponseDTO } from "../matches/match.types.js";
export interface StandingRowDTO {
  position: number; team: TeamBriefDTO; played: number; won: number; drawn: number; lost: number;
  goalsFor: number; goalsAgainst: number; goalDifference: number; points: number; qualified: boolean;
}
export interface GroupStandingDTO { groupName: string; rows: StandingRowDTO[]; }
export interface TopScorerDTO { rank: number; player: PlayerPublicDTO; team: TeamBriefDTO | null; goals: number; }
export interface OverallTeamStatisticsDTO {
  team: TeamBriefDTO; played: number; goalsFor: number; goalsAgainst: number; cleanSheets: number;
}
export interface TeamStatisticsDTO {
  team: TeamBriefDTO;
  group: { played: number; won: number; drawn: number; lost: number; goalsFor: number; goalsAgainst: number; goalDifference: number; points: number; };
  overall: { played: number; goalsFor: number; goalsAgainst: number; cleanSheets: number; };
}
export interface DashboardStatisticsDTO {
  tournamentName: string; startDate: Date; endDate: Date; totalMatchesPlayed: number; totalGoals: number;
  activeTeams: number; activePlayers: number; pendingPlayers: number; soldPlayers: number; unsoldPlayers: number;
  totalAuctionSpend: number; upcomingMatchCount: number; topScorer: TopScorerDTO | null;
  mostScoringTeam: { team: TeamBriefDTO; goals: number } | null;
  mostConcedingTeam: { team: TeamBriefDTO; goals: number } | null;
  mostCleanSheets: Array<{ team: TeamBriefDTO; cleanSheets: number }>;
  upcomingFixtures: MatchResponseDTO[]; recentResults: MatchResponseDTO[]; alerts: string[];
}
