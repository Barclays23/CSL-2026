import { Types } from "mongoose";
import { AppError } from "../../shared/errors/appError.js";
import type { ISettingsService } from "../settings/settings.types.js";
import type { PlayerRepositoryContract, PlayerPublicDTO, PlayerStatisticsEntity } from "../players/player.types.js";
import type { TeamBriefDTO, TeamEntity, TeamRepositoryContract } from "../teams/team.types.js";
import type { MatchEntity, MatchPlayerBriefDTO, MatchPlayerReferenceEntity, MatchResponseDTO, MatchTeamReferenceEntity, PopulatedGoalEntity, PopulatedMatchEntity } from "../matches/match.types.js";
import type {
  DashboardSummaryDTO,
  GroupStandingDTO,
  IStatisticsService,
  OverallTeamStatisticsDTO,
  StandingRowDTO,
  TeamStatisticsDTO,
  TopScorerDTO,
} from "./statistics.types.js";
import type { IStatisticsRepository } from "./statistics.repository.js";

interface MutableStanding {
  team: TeamBriefDTO;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
}

interface MutableTeamTotals {
  team: TeamBriefDTO;
  played: number;
  goalsFor: number;
  goalsAgainst: number;
  cleanSheets: number;
}

export class StatisticsService implements IStatisticsService {
  constructor(
    private readonly _statisticsRepository: IStatisticsRepository,
    private readonly _settingsService: ISettingsService,
    private readonly _playerRepository: PlayerRepositoryContract,
    private readonly _teamRepository: TeamRepositoryContract,
  ) {}

  async getGroupStandings(): Promise<GroupStandingDTO[]> {
    const [completedGroupMatches, activeTeams, settings] = await Promise.all([
      this._statisticsRepository.findCompletedGroupStageMatches(),
      this._statisticsRepository.findActiveTeams(),
      this._settingsService.getTournamentSettings(),
    ]);

    const standingByTeamId = new Map<string, MutableStanding>();

    for (const team of activeTeams) {
      const briefTeam = this.mapTeamToBriefDTO(team);
      const teamId = String(team._id);
      standingByTeamId.set(teamId, {
        team: briefTeam,
        played: 0,
        won: 0,
        drawn: 0,
        lost: 0,
        goalsFor: 0,
        goalsAgainst: 0,
        goalDifference: 0,
        points: 0,
      });
    }

    for (const match of completedGroupMatches) {
      this.applyMatchToGroupStandings(match, standingByTeamId, settings.pointsRule);
    }

    const groupRows = new Map<string, MutableStanding[]>();
    for (const row of standingByTeamId.values()) {
      row.goalDifference = row.goalsFor - row.goalsAgainst;
      const groupName = row.team.groupName ?? "Ungrouped";
      const rows = groupRows.get(groupName) ?? [];
      rows.push(row);
      groupRows.set(groupName, rows);
    }

    return [...groupRows.entries()]
      .sort(([firstGroup], [secondGroup]) => firstGroup.localeCompare(secondGroup))
      .map(([groupName, rows]) => ({
        groupName,
        rows: rows
          .sort((first, second) =>
            second.points - first.points ||
            second.goalDifference - first.goalDifference ||
            second.goalsFor - first.goalsFor ||
            first.team.name.localeCompare(second.team.name),
          )
          .map((row, index): StandingRowDTO => ({
            ...row,
            position: index + 1,
            qualified: index < 2,
          })),
      }));
  }

  async getTopScorers(): Promise<TopScorerDTO[]> {
    const [completedMatches, players, teams] = await Promise.all([
      this._statisticsRepository.findCompletedMatches(),
      this._statisticsRepository.findPlayersForTournamentStatistics(),
      this._statisticsRepository.findAllTeams(),
    ]);

    const playerById = new Map<string, PlayerStatisticsEntity>(players.map((player) => [String(player._id), player]));
    const teamById = new Map<string, TeamBriefDTO>(teams.map((team) => [String(team._id), this.mapTeamToBriefDTO(team)]));
    const goalCountByPlayerId = new Map<string, number>();
    const scoringTeamByPlayerId = new Map<string, string>();

    for (const match of completedMatches) {
      for (const goal of match.goals) {
        if (goal.goalType !== "normal" || !goal.scorerRef) continue;
        const playerId = String(goal.scorerRef);
        goalCountByPlayerId.set(playerId, (goalCountByPlayerId.get(playerId) ?? 0) + 1);
        scoringTeamByPlayerId.set(playerId, String(goal.scoringTeamRef));
      }
    }

    const rankedScorers = [...goalCountByPlayerId.entries()]
      .map(([playerId, goals]) => ({ playerId, goals, player: playerById.get(playerId) }))
      .filter((entry): entry is { playerId: string; goals: number; player: PlayerStatisticsEntity } => entry.player !== undefined)
      .sort((first, second) => second.goals - first.goals || first.player.name.localeCompare(second.player.name));

    let previousGoals = -1;
    let previousRank = 0;

    return rankedScorers.map((entry, index) => {
      if (entry.goals !== previousGoals) {
        previousRank = index + 1;
        previousGoals = entry.goals;
      }

      const scoringTeamId = scoringTeamByPlayerId.get(entry.playerId) ?? (entry.player.teamRef ? String(entry.player.teamRef) : null);
      const scoringTeam = scoringTeamId ? teamById.get(scoringTeamId) ?? null : null;

      return {
        rank: previousRank,
        player: this.mapPlayerToPublicDTO(entry.player, scoringTeam),
        team: scoringTeam,
        goals: entry.goals,
      };
    });
  }

  async getOverallTeamStatistics(): Promise<OverallTeamStatisticsDTO[]> {
    const [completedMatches, activeTeams] = await Promise.all([
      this._statisticsRepository.findCompletedMatches(),
      this._statisticsRepository.findActiveTeams(),
    ]);

    const totalsByTeamId = new Map<string, MutableTeamTotals>();
    for (const team of activeTeams) {
      totalsByTeamId.set(String(team._id), {
        team: this.mapTeamToBriefDTO(team),
        played: 0,
        goalsFor: 0,
        goalsAgainst: 0,
        cleanSheets: 0,
      });
    }

    for (const match of completedMatches) {
      const team1Id = String(match.team1Ref);
      const team2Id = String(match.team2Ref);
      const team1Totals = totalsByTeamId.get(team1Id);
      const team2Totals = totalsByTeamId.get(team2Id);
      if (!team1Totals || !team2Totals) continue;

      const team1Goals = this.countGoalsCreditedToTeam(match, team1Id);
      const team2Goals = this.countGoalsCreditedToTeam(match, team2Id);

      team1Totals.played += 1;
      team2Totals.played += 1;
      team1Totals.goalsFor += team1Goals;
      team1Totals.goalsAgainst += team2Goals;
      team2Totals.goalsFor += team2Goals;
      team2Totals.goalsAgainst += team1Goals;

      if (team2Goals === 0) team1Totals.cleanSheets += 1;
      if (team1Goals === 0) team2Totals.cleanSheets += 1;
    }

    return [...totalsByTeamId.values()];
  }

  async getTeamStatistics(teamId: string): Promise<TeamStatisticsDTO> {
    this.ensureValidTeamId(teamId);
    const [team, groupStandings, overallStatistics] = await Promise.all([
      this._teamRepository.findTeamById(teamId),
      this.getGroupStandings(),
      this.getOverallTeamStatistics(),
    ]);

    if (!team) throw new AppError("Team not found", 404, "TEAM_NOT_FOUND");

    const teamBrief = this.mapTeamToBriefDTO(team);
    const groupStanding = groupStandings
      .flatMap((group) => group.rows)
      .find((standing) => standing.team._id === teamId);
    const overall = overallStatistics.find((statistics) => statistics.team._id === teamId);

    return {
      team: teamBrief,
      group: groupStanding
        ? {
            played: groupStanding.played,
            won: groupStanding.won,
            drawn: groupStanding.drawn,
            lost: groupStanding.lost,
            goalsFor: groupStanding.goalsFor,
            goalsAgainst: groupStanding.goalsAgainst,
            goalDifference: groupStanding.goalDifference,
            points: groupStanding.points,
          }
        : {
            played: 0,
            won: 0,
            drawn: 0,
            lost: 0,
            goalsFor: 0,
            goalsAgainst: 0,
            goalDifference: 0,
            points: 0,
          },
      overall: overall
        ? {
            played: overall.played,
            goalsFor: overall.goalsFor,
            goalsAgainst: overall.goalsAgainst,
            cleanSheets: overall.cleanSheets,
          }
        : { played: 0, goalsFor: 0, goalsAgainst: 0, cleanSheets: 0 },
    };
  }

  async getDashboardStatistics(): Promise<DashboardSummaryDTO> {
    const [
      settings,
      activeTeams,
      auctionTotals,
      completedMatches,
      upcomingFixtures,
      recentResults,
      topScorers,
      overallTeamStatistics,
      upcomingMatchCount,
    ] = await Promise.all([
      this._settingsService.getTournamentSettings(),
      this._teamRepository.countActiveTeams(),
      this._playerRepository.getPlayerAuctionCounts(),
      this._statisticsRepository.findCompletedMatches(),
      this._statisticsRepository.findUpcomingFixtureCards(4),
      this._statisticsRepository.findRecentResultCards(4),
      this.getTopScorers(),
      this.getOverallTeamStatistics(),
      this._statisticsRepository.countScheduledFixtures(),
    ]);

    return {
      tournamentName: settings.tournamentName,
      startDate: settings.startDate.toISOString(),
      endDate: settings.endDate.toISOString(),
      totalMatchesPlayed: completedMatches.length,
      totalGoals: completedMatches.reduce((total, match) => total + match.goals.length, 0),
      activeTeams,
      activePlayers: auctionTotals.activeAuctionPlayers,
      pendingPlayers: auctionTotals.pendingPlayers,
      soldPlayers: auctionTotals.soldPlayers,
      unsoldPlayers: auctionTotals.unsoldPlayers,
      totalAuctionSpend: auctionTotals.totalAuctionSpend,
      upcomingMatchCount,
      topScorer: topScorers[0] ?? null,
      mostScoringTeam: this.getTeamGoalLeader(overallTeamStatistics, "goalsFor"),
      mostConcedingTeam: this.getTeamGoalLeader(overallTeamStatistics, "goalsAgainst"),
      mostCleanSheets: this.getCleanSheetLeaders(overallTeamStatistics),
      upcomingFixtures: upcomingFixtures.map((match) => this.mapPopulatedMatchToDTO(match)),
      recentResults: recentResults.map((match) => this.mapPopulatedMatchToDTO(match)),
      alerts: [],
    };
  }

  private applyMatchToGroupStandings(
    match: MatchEntity,
    standings: Map<string, MutableStanding>,
    pointsRule: { win: number; draw: number; loss: number },
  ): void {
    const team1Id = String(match.team1Ref);
    const team2Id = String(match.team2Ref);
    const team1Standing = standings.get(team1Id);
    const team2Standing = standings.get(team2Id);
    if (!team1Standing || !team2Standing) return;

    const team1Goals = this.countGoalsCreditedToTeam(match, team1Id);
    const team2Goals = this.countGoalsCreditedToTeam(match, team2Id);

    team1Standing.played += 1;
    team2Standing.played += 1;
    team1Standing.goalsFor += team1Goals;
    team1Standing.goalsAgainst += team2Goals;
    team2Standing.goalsFor += team2Goals;
    team2Standing.goalsAgainst += team1Goals;

    if (team1Goals > team2Goals) {
      team1Standing.won += 1;
      team2Standing.lost += 1;
      team1Standing.points += pointsRule.win;
      team2Standing.points += pointsRule.loss;
    } else if (team2Goals > team1Goals) {
      team2Standing.won += 1;
      team1Standing.lost += 1;
      team2Standing.points += pointsRule.win;
      team1Standing.points += pointsRule.loss;
    } else {
      team1Standing.drawn += 1;
      team2Standing.drawn += 1;
      team1Standing.points += pointsRule.draw;
      team2Standing.points += pointsRule.draw;
    }
  }

  private countGoalsCreditedToTeam(match: MatchEntity, teamId: string): number {
    return match.goals.filter((goal) => String(goal.scoringTeamRef) === teamId).length;
  }

  private getTeamGoalLeader(
    statistics: OverallTeamStatisticsDTO[],
    field: "goalsFor" | "goalsAgainst",
  ): { team: TeamBriefDTO; goals: number } | null {
    const leader = [...statistics].sort(
      (first, second) => second[field] - first[field] || first.team.name.localeCompare(second.team.name),
    )[0];

    if (!leader || leader[field] === 0) return null;
    return { team: leader.team, goals: leader[field] };
  }

  private getCleanSheetLeaders(statistics: OverallTeamStatisticsDTO[]): { team: TeamBriefDTO; cleanSheets: number }[] {
    const highestCount = statistics.reduce((highest, team) => Math.max(highest, team.cleanSheets), 0);
    if (highestCount === 0) return [];
    return statistics
      .filter((team) => team.cleanSheets === highestCount)
      .map((team) => ({ team: team.team, cleanSheets: team.cleanSheets }));
  }

  private mapTeamToBriefDTO(team: TeamEntity): TeamBriefDTO {
    return {
      _id: String(team._id),
      name: team.name,
      shortName: team.shortName,
      logo: team.logo,
      groupName: team.groupName,
    };
  }

  private mapPlayerToPublicDTO(player: PlayerStatisticsEntity, scoringTeam: TeamBriefDTO | null): PlayerPublicDTO {
    const teamRef = scoringTeam?._id ?? (player.teamRef ? String(player.teamRef) : null);
    return {
      _id: String(player._id),
      name: player.name,
      position: player.position,
      isIconPlayer: player.isIconPlayer,
      teamRef,
      team: scoringTeam,
      jerseyNo: player.jerseyNo,
      auctionPrice: player.auctionPrice,
      auctionStatus: player.auctionStatus,
      status: player.status,
      profilePic: player.profilePic,
    };
  }

  private mapPopulatedMatchToDTO(match: PopulatedMatchEntity): MatchResponseDTO {
    return {
      _id: String(match._id),
      matchNo: match.matchNo,
      stage: match.stage,
      groupName: match.groupName,
      kickoffAt: match.kickoffAt.toISOString(),
      venue: match.venue,
      team1Ref: this.mapMatchTeamReference(match.team1Ref),
      team2Ref: this.mapMatchTeamReference(match.team2Ref),
      status: match.status,
      goals: match.goals.map((goal) => ({
        _id: String(goal._id),
        scoringTeamRef: this.mapMatchTeamReference(goal.scoringTeamRef),
        goalType: goal.goalType,
        scorerRef: this.mapMatchPlayerReference(goal.scorerRef),
        ownGoalPlayerRef: this.mapMatchPlayerReference(goal.ownGoalPlayerRef),
        createdAt: goal.createdAt.toISOString(),
      })),
      penaltyShootout: match.penaltyShootout,
      notes: match.notes,
      createdAt: match.createdAt.toISOString(),
      updatedAt: match.updatedAt.toISOString(),
    };
  }

  private mapMatchTeamReference(reference: Types.ObjectId | MatchTeamReferenceEntity): string | TeamBriefDTO {
    if (reference instanceof Types.ObjectId) return String(reference);
    return {
      _id: String(reference._id),
      name: reference.name,
      shortName: reference.shortName,
      logo: reference.logo,
      groupName: reference.groupName,
    };
  }

  private mapMatchPlayerReference(
    reference: Types.ObjectId | MatchPlayerReferenceEntity | null,
  ): string | MatchPlayerBriefDTO | null {
    if (!reference) return null;
    if (reference instanceof Types.ObjectId) return String(reference);
    return {
      _id: String(reference._id),
      name: reference.name,
      position: reference.position,
      jerseyNo: reference.jerseyNo,
      profilePic: reference.profilePic,
      teamRef: reference.teamRef ? String(reference.teamRef) : null,
    };
  }

  private ensureValidTeamId(teamId: string): void {
    if (!Types.ObjectId.isValid(teamId)) throw new AppError("Invalid team ID", 400, "INVALID_ID");
  }
}
