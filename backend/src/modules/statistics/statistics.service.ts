import { AppError } from "../../shared/errors/appError.js";
import { SettingsService } from "../settings/settings.service.js";
import { PlayerRepository } from "../players/player.repository.js";
import { TeamRepository } from "../teams/team.repository.js";
import { StatisticsRepository } from "./statistics.repository.js";

type Row = Record<string, unknown>;

interface TeamBrief {
  _id: string;
  name: string;
  shortName: unknown;
  logo: unknown;
  groupName: unknown;
}

interface StandingRow {
  team: TeamBrief;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
  position?: number;
  qualified?: boolean;
}

interface OverallTeamRow {
  team: TeamBrief;
  played: number;
  goalsFor: number;
  goalsAgainst: number;
  cleanSheets: number;
}

const asRow = (value: unknown): Row =>
  value && typeof value === "object" ? (value as Row) : {};

const idOf = (value: unknown): string => {
  if (value && typeof value === "object" && "_id" in value) {
    return String((value as Row)._id);
  }
  return String(value);
};

const brief = (value: unknown): TeamBrief => {
  const team = asRow(value);
  return {
    _id: String(team._id),
    name: String(team.name ?? ""),
    shortName: team.shortName ?? null,
    logo: team.logo ?? null,
    groupName: team.groupName ?? null,
  };
};

const getGoals = (match: Row): Row[] =>
  Array.isArray(match.goals) ? (match.goals as Row[]) : [];

export class StatisticsService {
  constructor(
    private readonly _statisticsRepo: StatisticsRepository,
    private readonly _settingsService: SettingsService,
    private readonly _playerRepo: PlayerRepository,
    private readonly _teamRepo: TeamRepository,
  ) {}

  async getTopScorers() {
    const [goalRows, players, teams] = await Promise.all([
      this._statisticsRepo.topScorerRows(),
      this._statisticsRepo.teamScorers(),
      this._statisticsRepo.activeTeams(),
    ]);

    const playerMap = new Map(
      (players as unknown as Row[]).map((player) => [
        String(player._id),
        player,
      ]),
    );
    const teamMap = new Map(
      (teams as unknown as Row[]).map((team) => [String(team._id), team]),
    );

    const result: Row[] = [];
    let previousGoals = -1;
    let currentRank = 0;

    for (const raw of goalRows as unknown as Row[]) {
      const goals = Number(raw.goals ?? 0);
      const player = playerMap.get(String(raw._id));

      // Keep the aggregation rank stable even if a player record is missing.
      if (goals !== previousGoals) {
        currentRank = result.length + 1;
        previousGoals = goals;
      }
      if (!player) continue;

      const team = player.teamRef
        ? teamMap.get(idOf(player.teamRef))
        : undefined;

      result.push({
        rank: currentRank,
        player: {
          _id: String(player._id),
          name: player.name,
          position: player.position,
          isIconPlayer: Boolean(player.isIconPlayer),
          teamRef: player.teamRef ? idOf(player.teamRef) : null,
          jerseyNo: player.jerseyNo ?? null,
          profilePic: player.profilePic ?? null,
        },
        team: team ? brief(team) : null,
        goals,
      });
    }

    return result;
  }

  private async groupStandingsData() {
    const [matches, teams, settings] = await Promise.all([
      this._statisticsRepo.completedGroupMatches(),
      this._statisticsRepo.activeTeams(),
      this._settingsService.get(),
    ]);

    const rows = new Map<string, StandingRow>();

    for (const rawTeam of teams as unknown as Row[]) {
      const team = brief(rawTeam);
      rows.set(team._id, {
        team,
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

    for (const rawMatch of matches as unknown as Row[]) {
      const team1Id = idOf(rawMatch.team1Ref);
      const team2Id = idOf(rawMatch.team2Ref);
      const team1Row = rows.get(team1Id);
      const team2Row = rows.get(team2Id);

      if (!team1Row || !team2Row) continue;

      const goals = getGoals(rawMatch);
      const team1Goals = goals.filter(
        (goal) => idOf(goal.scoringTeamRef) === team1Id,
      ).length;
      const team2Goals = goals.filter(
        (goal) => idOf(goal.scoringTeamRef) === team2Id,
      ).length;

      team1Row.played += 1;
      team2Row.played += 1;
      team1Row.goalsFor += team1Goals;
      team1Row.goalsAgainst += team2Goals;
      team2Row.goalsFor += team2Goals;
      team2Row.goalsAgainst += team1Goals;

      if (team1Goals > team2Goals) {
        team1Row.won += 1;
        team2Row.lost += 1;
        team1Row.points += Number(settings.pointsRule.win);
        team2Row.points += Number(settings.pointsRule.loss);
      } else if (team2Goals > team1Goals) {
        team2Row.won += 1;
        team1Row.lost += 1;
        team2Row.points += Number(settings.pointsRule.win);
        team1Row.points += Number(settings.pointsRule.loss);
      } else {
        team1Row.drawn += 1;
        team2Row.drawn += 1;
        team1Row.points += Number(settings.pointsRule.draw);
        team2Row.points += Number(settings.pointsRule.draw);
      }
    }

    const groups = new Map<string, StandingRow[]>();

    for (const row of rows.values()) {
      row.goalDifference = row.goalsFor - row.goalsAgainst;
      const groupName = String(row.team.groupName ?? "Ungrouped");
      const groupRows = groups.get(groupName) ?? [];
      groupRows.push(row);
      groups.set(groupName, groupRows);
    }

    return [...groups.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([groupName, groupRows]) => ({
        groupName,
        rows: groupRows
          .sort(
            (a, b) =>
              b.points - a.points ||
              b.goalDifference - a.goalDifference ||
              b.goalsFor - a.goalsFor ||
              a.team.name.localeCompare(b.team.name),
          )
          .map((row, index) => ({
            ...row,
            position: index + 1,
            qualified: index < 2,
          })),
      }));
  }

  async getStandings() {
    return this.groupStandingsData();
  }

  async getOverallTeamStatistics(): Promise<OverallTeamRow[]> {
    const [matches, teams] = await Promise.all([
      this._statisticsRepo.completedMatches(),
      this._statisticsRepo.activeTeams(),
    ]);

    return (teams as unknown as Row[]).map((rawTeam) => {
      const team = brief(rawTeam);
      let played = 0;
      let goalsFor = 0;
      let goalsAgainst = 0;
      let cleanSheets = 0;

      for (const rawMatch of matches as unknown as Row[]) {
        const team1Id = idOf(rawMatch.team1Ref);
        const team2Id = idOf(rawMatch.team2Ref);

        if (team._id !== team1Id && team._id !== team2Id) continue;

        const goals = getGoals(rawMatch);
        const scored = goals.filter(
          (goal) => idOf(goal.scoringTeamRef) === team._id,
        ).length;
        const conceded = goals.length - scored;

        played += 1;
        goalsFor += scored;
        goalsAgainst += conceded;

        if (conceded === 0) cleanSheets += 1;
      }

      return { team, played, goalsFor, goalsAgainst, cleanSheets };
    });
  }

  async getTeamStatistics(teamId: string) {
    const [standingGroups, overallRows] = await Promise.all([
      this.groupStandingsData(),
      this.getOverallTeamStatistics(),
    ]);

    const standing = standingGroups
      .flatMap((group) => group.rows)
      .find((row) => row.team._id === teamId);
    const overall = overallRows.find((row) => row.team._id === teamId);

    if (!overall) {
      throw new AppError("Team not found", 404, "NOT_FOUND");
    }

    return {
      team: overall.team,
      group: standing
        ? {
            played: standing.played,
            won: standing.won,
            drawn: standing.drawn,
            lost: standing.lost,
            goalsFor: standing.goalsFor,
            goalsAgainst: standing.goalsAgainst,
            goalDifference: standing.goalDifference,
            points: standing.points,
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
      overall: {
        played: overall.played,
        goalsFor: overall.goalsFor,
        goalsAgainst: overall.goalsAgainst,
        cleanSheets: overall.cleanSheets,
      },
    };
  }

  async getDashboardStatistics() {
    const [
      settings,
      activeTeams,
      auction,
      completedMatches,
      upcomingFixtures,
      recentResults,
      topScorers,
      overallRows,
      upcomingMatchCount,
    ] = await Promise.all([
      this._settingsService.get(),
      this._teamRepo.countActive(),
      this._playerRepo.auctionCounts(),
      this._statisticsRepo.completedMatches(),
      this._statisticsRepo.upcomingFixtures(),
      this._statisticsRepo.recentResults(),
      this.getTopScorers(),
      this.getOverallTeamStatistics(),
      this._statisticsRepo.upcomingCount(),
    ]);

    const matches = completedMatches as unknown as Row[];
    const totalGoals = matches.reduce(
      (total, match) => total + getGoals(match).length,
      0,
    );

    const pickLeader = (field: "goalsFor" | "goalsAgainst") => {
      const sorted = [...overallRows].sort(
        (a, b) =>
          b[field] - a[field] || a.team.name.localeCompare(b.team.name),
      );
      const leader = sorted[0];

      return leader && leader[field] > 0
        ? { team: leader.team, goals: leader[field] }
        : null;
    };

    const maxCleanSheets = Math.max(
      0,
      ...overallRows.map((row) => row.cleanSheets),
    );
    const mostCleanSheets =
      maxCleanSheets > 0
        ? overallRows
            .filter((row) => row.cleanSheets === maxCleanSheets)
            .map((row) => ({
              team: row.team,
              cleanSheets: row.cleanSheets,
            }))
        : [];

    return {
      tournamentName: settings.tournamentName,
      startDate: settings.startDate,
      endDate: settings.endDate,
      totalMatchesPlayed: matches.length,
      totalGoals,
      activeTeams,
      activePlayers: auction.activeAuctionPlayers,
      pendingPlayers: auction.pendingPlayers,
      soldPlayers: auction.soldPlayers,
      unsoldPlayers: auction.unsoldPlayers,
      totalAuctionSpend: auction.totalAuctionSpend,
      upcomingMatchCount,
      topScorer: topScorers[0] ?? null,
      mostScoringTeam: pickLeader("goalsFor"),
      mostConcedingTeam: pickLeader("goalsAgainst"),
      mostCleanSheets,
      upcomingFixtures,
      recentResults,
      alerts: [],
    };
  }
}
