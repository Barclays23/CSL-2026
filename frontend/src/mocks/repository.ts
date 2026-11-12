import type { Pagination } from "@/types/api.types";
import type { AdminUser } from "@/types/auth.types";
import type { ManagerQuery, ManagerWrite, PublicManager } from "@/types/manager.types";
import type { GoalWrite, Match, MatchQuery, MatchWrite } from "@/types/match.types";
import type { PlayerBrief } from "@/types/match.types";
import type { AdminPlayer, PlayerQuery, PlayerWrite, PublicPlayer } from "@/types/player.types";
import type { SettingsUpdate } from "@/types/settings.types";
import type { AdminSponsor, PublicSponsor, SponsorQuery, SponsorWrite } from "@/types/sponsor.types";
import type { DashboardSummary, GroupStanding, StandingRow, TeamStatistics, TopScorer } from "@/types/statistics.types";
import type { AuctionSummary, Team, TeamAuctionCard, TeamBrief, TeamSquadStats, TeamWrite } from "@/types/team.types";
import { isKnockout } from "@/constants/football";
import {
  commit,
  isAdmin,
  readDb,
  readSession,
  requireAdmin,
  resetPreviewData,
  uid,
  writeSession,
  type Database,
  type StoredGoal,
  type StoredManager,
  type StoredMatch,
  type StoredPlayer,
  type StoredSponsor,
  type StoredTeam,
} from "@/mocks/store";
import { ApiError } from "@/utils/errorHandler";
import { getMatchScore } from "@/utils/getMatchScore";

const PREVIEW_EMAIL = "admin@csl.local";
const PREVIEW_PASSWORD = "Admin@12345";

function ok<T>(message: string, data: T, pagination?: Pagination) {
  return { success: true as const, message, data, ...(pagination ? { pagination } : {}) };
}

function fail(status: number, message: string, fieldErrors?: Record<string, string>): never {
  throw new ApiError(status, message, { fieldErrors, errorCode: status === 409 ? "CONFLICT" : "RULE" });
}

function paginate<T>(items: T[], page = 1, limit = 12) {
  const safeLimit = Math.min(Math.max(limit, 1), 60);
  const total = items.length;
  const totalPages = Math.max(1, Math.ceil(total / safeLimit));
  const safePage = Math.min(Math.max(page, 1), totalPages);
  const start = (safePage - 1) * safeLimit;
  return {
    slice: items.slice(start, start + safeLimit),
    pagination: { page: safePage, limit: safeLimit, total, totalPages },
  };
}

function briefTeam(team: StoredTeam): TeamBrief {
  return {
    _id: team._id,
    name: team.name,
    shortName: team.shortName,
    logo: team.logo,
    groupName: team.groupName,
  };
}

function presentTeam(team: StoredTeam): Team {
  return { ...team };
}

function presentPlayer(db: Database, player: StoredPlayer, admin: boolean): PublicPlayer | AdminPlayer {
  const team = player.teamRef ? db.teams.find((item) => item._id === player.teamRef) : null;
  const base: PublicPlayer = {
    _id: player._id,
    name: player.name,
    position: player.position,
    isIconPlayer: player.isIconPlayer,
    teamRef: player.teamRef,
    team: team ? briefTeam(team) : null,
    jerseyNo: player.jerseyNo,
    auctionPrice: player.auctionPrice,
    auctionStatus: player.auctionStatus,
    status: player.status,
    profilePic: player.profilePic,
  };
  if (!admin) return base;
  return { ...base, mobile: player.mobile, email: player.email, dateOfBirth: player.dateOfBirth };
}

function playerBrief(player: StoredPlayer): PlayerBrief {
  return {
    _id: player._id,
    name: player.name,
    position: player.position,
    jerseyNo: player.jerseyNo,
    profilePic: player.profilePic,
    teamRef: player.teamRef,
  };
}

function presentMatch(db: Database, match: StoredMatch): Match {
  const team1 = db.teams.find((team) => team._id === match.team1Ref);
  const team2 = db.teams.find((team) => team._id === match.team2Ref);
  return {
    ...match,
    team1Ref: team1 ? briefTeam(team1) : match.team1Ref,
    team2Ref: team2 ? briefTeam(team2) : match.team2Ref,
    goals: match.goals.map((goal) => {
      const scoring = db.teams.find((team) => team._id === goal.scoringTeamRef);
      const scorer = goal.scorerRef ? db.players.find((player) => player._id === goal.scorerRef) : null;
      const own = goal.ownGoalPlayerRef ? db.players.find((player) => player._id === goal.ownGoalPlayerRef) : null;
      return {
        ...goal,
        scoringTeamRef: scoring ? briefTeam(scoring) : goal.scoringTeamRef,
        scorerRef: scorer ? playerBrief(scorer) : null,
        ownGoalPlayerRef: own ? playerBrief(own) : null,
      };
    }),
  };
}

function presentManager(db: Database, manager: StoredManager, admin: boolean): PublicManager {
  const team = manager.teamRef ? db.teams.find((item) => item._id === manager.teamRef) : null;
  const base: PublicManager = {
    _id: manager._id,
    name: manager.name,
    teamRef: manager.teamRef,
    team: team ? briefTeam(team) : null,
    role: manager.role,
    profilePic: manager.profilePic,
    status: manager.status,
  };
  if (!admin) return base;
  return { ...base, mobile: manager.mobile, email: manager.email, dateOfBirth: manager.dateOfBirth };
}

function presentSponsor(sponsor: StoredSponsor, admin: boolean): PublicSponsor | AdminSponsor {
  const base: PublicSponsor = {
    _id: sponsor._id,
    name: sponsor.name,
    logo: sponsor.logo,
    tier: sponsor.tier,
    website: sponsor.website,
    status: sponsor.status,
  };
  if (!admin) return base;
  return {
    ...base,
    contactPerson: sponsor.contactPerson,
    contactMobile: sponsor.contactMobile,
    notes: sponsor.notes,
  };
}

function squadOf(db: Database, teamId: string, exceptId?: string) {
  return db.players.filter(
    (player) => player.teamRef === teamId && player.auctionStatus === "sold" && player._id !== exceptId,
  );
}

function applyPlayer(db: Database, input: PlayerWrite, existing?: StoredPlayer): StoredPlayer {
  const mobile = input.mobile;
  const email = input.email?.trim().toLowerCase() || null;
  if (db.players.some((player) => player.mobile === mobile && player._id !== existing?._id)) {
    fail(409, "A player with this mobile number already exists", { mobile: "This mobile number is already used" });
  }
  if (email && db.players.some((player) => player.email === email && player._id !== existing?._id)) {
    fail(409, "A player with this email already exists", { email: "This email is already used" });
  }

  const next: StoredPlayer = {
    _id: existing?._id ?? uid("player"),
    name: input.name.trim(),
    mobile,
    email,
    dateOfBirth: input.dateOfBirth || null,
    position: input.position,
    isIconPlayer: input.isIconPlayer,
    teamRef: input.teamRef || null,
    jerseyNo: input.jerseyNo ?? null,
    auctionPrice: input.auctionPrice ?? 0,
    auctionStatus: input.auctionStatus,
    status: input.status,
    profilePic: input.profilePic === undefined ? existing?.profilePic ?? null : input.profilePic,
  };

  if (next.status === "inactive") {
    next.teamRef = null;
    next.jerseyNo = null;
    next.auctionPrice = 0;
    next.auctionStatus = "pending";
  } else if (next.auctionStatus !== "sold") {
    next.teamRef = null;
    next.jerseyNo = null;
    next.auctionPrice = 0;
  } else {
    if (!next.teamRef) fail(422, "A sold player must have a team", { teamRef: "Choose a team" });
    if (next.auctionPrice <= 0) {
      fail(422, "A sold player needs a price above zero", { auctionPrice: "Enter a price above zero" });
    }
    const team = db.teams.find((item) => item._id === next.teamRef);
    if (!team || team.status !== "active") {
      fail(422, "Players can only be sold to an active team", { teamRef: "Choose an active team" });
    }
    const squad = squadOf(db, team._id, next._id);
    const settings = db.settings;
    if (squad.length >= settings.maxPlayersPerTeam) {
      fail(422, `${team.name} already has ${settings.maxPlayersPerTeam} players`, {
        teamRef: "This squad is already full",
      });
    }
    const spend = squad.reduce((sum, player) => sum + player.auctionPrice, 0);
    if (spend + next.auctionPrice > settings.auctionBudgetPerTeam) {
      fail(422, `${team.name} would go over the auction budget`, {
        auctionPrice: "This price exceeds the remaining budget",
      });
    }
    if (next.isIconPlayer && squad.filter((player) => player.isIconPlayer).length >= settings.requiredIconPlayers) {
      fail(422, `${team.name} already has the required icon player`, {
        isIconPlayer: "This team cannot take another icon player",
      });
    }
    if (next.position === "GK" && squad.filter((player) => player.position === "GK").length >= settings.requiredGoalkeepers) {
      fail(422, `${team.name} already has the required goalkeeper`, {
        position: "This team cannot take another goalkeeper",
      });
    }
    if (next.jerseyNo != null && squad.some((player) => player.jerseyNo === next.jerseyNo)) {
      fail(409, "That jersey number is already used in this team", {
        jerseyNo: "Another player in this team already has this number",
      });
    }
  }

  if (next.status === "active") {
    const others = db.players.filter((player) => player.status === "active" && player._id !== next._id).length;
    if (others >= db.settings.maxActivePlayers) {
      fail(422, `The active player limit is ${db.settings.maxActivePlayers}`, {
        status: "Deactivate another player before adding this one",
      });
    }
  }
  return next;
}

function scorePair(match: StoredMatch) {
  return getMatchScore(match);
}

function validateShootout(match: StoredMatch) {
  const score = scorePair(match);
  const shootout = match.penaltyShootout;
  if (!isKnockout(match.stage)) {
    if (shootout) fail(422, "Group matches cannot have a penalty shootout", { team1Shootout: "Remove the shootout score" });
    return;
  }
  if (match.status !== "completed") {
    match.penaltyShootout = null;
    return;
  }
  if (!score.tied) {
    match.penaltyShootout = null;
    return;
  }
  if (!shootout) {
    fail(422, "A completed, level knockout match needs a penalty shootout", {
      team1Shootout: "Enter the shootout score",
    });
  }
  if (
    !Number.isInteger(shootout.team1Score) ||
    !Number.isInteger(shootout.team2Score) ||
    shootout.team1Score < 0 ||
    shootout.team2Score < 0 ||
    shootout.team1Score === shootout.team2Score
  ) {
    fail(422, "Shootout scores must be different whole numbers", { team2Shootout: "The shootout needs a winner" });
  }
}

function applyMatch(db: Database, input: MatchWrite, existing?: StoredMatch): StoredMatch {
  if (input.team1Ref === input.team2Ref) {
    fail(422, "A match needs two different teams", { team2Ref: "Choose a different team" });
  }
  const team1 = db.teams.find((team) => team._id === input.team1Ref);
  const team2 = db.teams.find((team) => team._id === input.team2Ref);
  if (!team1 || team1.status !== "active") fail(422, "Home team must be active", { team1Ref: "Choose an active team" });
  if (!team2 || team2.status !== "active") fail(422, "Away team must be active", { team2Ref: "Choose an active team" });
  const matchNo = input.matchNo.trim();
  if (db.matches.some((match) => match.matchNo.toLowerCase() === matchNo.toLowerCase() && match._id !== existing?._id)) {
    fail(409, "That match number is already used", { matchNo: "Match number must be unique" });
  }
  let groupName = input.groupName?.trim() || null;
  if (input.stage === "group") {
    if (!groupName) fail(422, "Group fixtures need a group name", { groupName: "Enter the group" });
    if (team1.groupName !== groupName || team2.groupName !== groupName) {
      fail(422, "Both teams must belong to this group", { groupName: "The selected teams are not both in this group" });
    }
  } else {
    groupName = null;
  }
  const next: StoredMatch = {
    _id: existing?._id ?? uid("match"),
    matchNo,
    stage: input.stage,
    groupName,
    kickoffAt: input.kickoffAt,
    venue: input.venue?.trim() || null,
    team1Ref: input.team1Ref,
    team2Ref: input.team2Ref,
    status: input.status,
    goals: existing?.goals ?? [],
    penaltyShootout: input.stage === "group" ? null : input.penaltyShootout ?? null,
    notes: input.notes?.trim() || null,
    createdAt: existing?.createdAt ?? new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  if (next.status === "cancelled") next.goals = [];
  validateShootout(next);
  return next;
}

function validateGoal(db: Database, match: StoredMatch, input: GoalWrite) {
  if (match.status === "cancelled") fail(422, "Cancelled matches cannot record goals");
  if (input.scoringTeamRef !== match.team1Ref && input.scoringTeamRef !== match.team2Ref) {
    fail(422, "The scoring team must be playing in this match", { scoringTeamRef: "Choose one of the two teams" });
  }
  const opponent = input.scoringTeamRef === match.team1Ref ? match.team2Ref : match.team1Ref;
  if (input.goalType === "normal") {
    if (input.scorerRef) {
      const scorer = db.players.find((player) => player._id === input.scorerRef);
      if (!scorer) fail(404, "Scorer not found", { scorerRef: "Choose a player from this team" });
      if (scorer.teamRef !== input.scoringTeamRef) {
        fail(422, "A normal scorer must belong to the team credited with the goal", {
          scorerRef: "This player is not in the scoring team",
        });
      }
    }
    return { scorerRef: input.scorerRef || null, ownGoalPlayerRef: null as string | null };
  }
  if (!input.ownGoalPlayerRef) {
    fail(422, "Choose the player who scored the own goal", { ownGoalPlayerRef: "Choose an opposing player" });
  }
  const own = db.players.find((player) => player._id === input.ownGoalPlayerRef);
  if (!own) fail(404, "Own-goal player not found", { ownGoalPlayerRef: "Choose an opposing player" });
  if (own.teamRef !== opponent) {
    fail(422, "An own goal must be credited to a player from the opposing team", {
      ownGoalPlayerRef: "This player is not on the opposing team",
    });
  }
  return { scorerRef: null as string | null, ownGoalPlayerRef: input.ownGoalPlayerRef };
}

function emptyRow(team: StoredTeam): StandingRow {
  return {
    position: 0,
    team: briefTeam(team),
    played: 0,
    won: 0,
    drawn: 0,
    lost: 0,
    goalsFor: 0,
    goalsAgainst: 0,
    goalDifference: 0,
    points: 0,
    qualified: false,
  };
}

function buildStandings(db: Database): GroupStanding[] {
  const groups = new Map<string, StandingRow[]>();
  for (const team of db.teams) {
    if (team.status !== "active" || !team.groupName) continue;
    const rows = groups.get(team.groupName) ?? [];
    rows.push(emptyRow(team));
    groups.set(team.groupName, rows);
  }
  const rule = db.settings.pointsRule;
  for (const match of db.matches) {
    if (match.status !== "completed" || match.stage !== "group" || !match.groupName) continue;
    const rows = groups.get(match.groupName);
    if (!rows) continue;
    const score = scorePair(match);
    const home = rows.find((row) => row.team._id === match.team1Ref);
    const away = rows.find((row) => row.team._id === match.team2Ref);
    if (!home || !away) continue;
    home.played += 1;
    away.played += 1;
    home.goalsFor += score.team1;
    home.goalsAgainst += score.team2;
    away.goalsFor += score.team2;
    away.goalsAgainst += score.team1;
    if (score.team1 > score.team2) {
      home.won += 1;
      away.lost += 1;
      home.points += rule.win;
      away.points += rule.loss;
    } else if (score.team1 < score.team2) {
      away.won += 1;
      home.lost += 1;
      away.points += rule.win;
      home.points += rule.loss;
    } else {
      home.drawn += 1;
      away.drawn += 1;
      home.points += rule.draw;
      away.points += rule.draw;
    }
  }
  return [...groups.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([groupName, rows]) => {
      const sorted = rows
        .map((row) => ({ ...row, goalDifference: row.goalsFor - row.goalsAgainst }))
        .sort((a, b) => {
          if (b.points !== a.points) return b.points - a.points;
          if (b.goalDifference !== a.goalDifference) return b.goalDifference - a.goalDifference;
          if (b.goalsFor !== a.goalsFor) return b.goalsFor - a.goalsFor;
          return a.team.name.localeCompare(b.team.name);
        })
        .map((row, index) => ({ ...row, position: index + 1, qualified: index < 2 }));
      return { groupName, rows: sorted };
    });
}

function topScorers(db: Database): TopScorer[] {
  const counts = new Map<string, number>();
  for (const match of db.matches) {
    if (match.status !== "completed") continue;
    for (const item of match.goals) {
      if (item.goalType === "normal" && item.scorerRef) {
        counts.set(item.scorerRef, (counts.get(item.scorerRef) ?? 0) + 1);
      }
    }
  }
  const rows = [...counts.entries()]
    .map(([playerId, goals]) => {
      const player = db.players.find((item) => item._id === playerId);
      if (!player) return null;
      const team = player.teamRef ? db.teams.find((item) => item._id === player.teamRef) : null;
      return {
        player: presentPlayer(db, player, false) as PublicPlayer,
        team: team ? briefTeam(team) : null,
        goals,
      };
    })
    .filter((row): row is Omit<TopScorer, "rank"> => Boolean(row))
    .sort((a, b) => b.goals - a.goals || a.player.name.localeCompare(b.player.name));
  let lastGoals = -1;
  let rank = 0;
  return rows.map((row, index) => {
    if (row.goals !== lastGoals) {
      rank = index + 1;
      lastGoals = row.goals;
    }
    return { ...row, rank };
  });
}

function teamGoalTotals(db: Database) {
  const totals = new Map<string, { scored: number; conceded: number; cleanSheets: number }>();
  for (const team of db.teams) totals.set(team._id, { scored: 0, conceded: 0, cleanSheets: 0 });
  for (const match of db.matches) {
    if (match.status !== "completed") continue;
    const score = scorePair(match);
    const home = totals.get(match.team1Ref);
    const away = totals.get(match.team2Ref);
    if (!home || !away) continue;
    home.scored += score.team1;
    home.conceded += score.team2;
    away.scored += score.team2;
    away.conceded += score.team1;
    if (score.team2 === 0) home.cleanSheets += 1;
    if (score.team1 === 0) away.cleanSheets += 1;
  }
  return totals;
}

function squadStats(db: Database, teamId: string): TeamSquadStats {
  const settings = db.settings;
  const squad = squadOf(db, teamId);
  const purchaseCost = squad.reduce((sum, player) => sum + player.auctionPrice, 0);
  return {
    auctionBudget: settings.auctionBudgetPerTeam,
    purchaseCost,
    remainingBalance: settings.auctionBudgetPerTeam - purchaseCost,
    playerCount: squad.length,
    remainingSlots: Math.max(settings.maxPlayersPerTeam - squad.length, 0),
    averagePurchaseCost: squad.length ? purchaseCost / squad.length : 0,
    iconPlayerCount: squad.filter((player) => player.isIconPlayer).length,
    goalkeeperCount: squad.filter((player) => player.position === "GK").length,
    maxPlayers: settings.maxPlayersPerTeam,
    requiredIcons: settings.requiredIconPlayers,
    requiredGoalkeepers: settings.requiredGoalkeepers,
  };
}

export const previewRepository = {
  async login(email: string, password: string) {
    const db = readDb();
    if (email.trim().toLowerCase() !== PREVIEW_EMAIL || password !== PREVIEW_PASSWORD) {
      fail(401, "Email or password is incorrect");
    }
    if (db.user.status === "blocked") fail(403, "This admin account is blocked");
    writeSession(db.user);
    return ok("Signed in", db.user);
  },
  async logout() {
    writeSession(null);
    return ok("Signed out", null);
  },
  async me() {
    const session = readSession();
    if (!session || !isAdmin()) return ok("No active admin session", null as AdminUser | null);
    return ok("Admin session", readDb().user);
  },
  async getSettings() {
    return ok("Settings loaded", readDb().settings);
  },
  async updateSettings(input: SettingsUpdate) {
    requireAdmin();
    const db = readDb();
    db.settings = { ...db.settings, ...input, singletonKey: "CSL_CURRENT", updatedAt: new Date().toISOString() };
    commit(db);
    return ok("Settings saved", db.settings);
  },
  async reset() {
    requireAdmin();
    const db = resetPreviewData();
    return ok("Sample tournament restored", db.settings);
  },
  async getPlayers(query: PlayerQuery = {}) {
    const db = readDb();
    const admin = isAdmin();
    let items = [...db.players];
    if (!admin) items = items.filter((player) => player.status === "active");
    if (query.search) {
      const needle = query.search.trim().toLowerCase();
      items = items.filter((player) => player.name.toLowerCase().includes(needle));
    }
    if (query.position) items = items.filter((player) => player.position === query.position);
    if (query.teamRef) {
      items = query.teamRef === "unassigned" ? items.filter((player) => !player.teamRef) : items.filter((player) => player.teamRef === query.teamRef);
    }
    if (admin && query.status) items = items.filter((player) => player.status === query.status);
    if (admin && query.auctionStatus) items = items.filter((player) => player.auctionStatus === query.auctionStatus);
    items.sort((a, b) => a.name.localeCompare(b.name));
    const page = paginate(items, query.page ?? 1, query.limit ?? 12);
    return ok(
      "Players loaded",
      page.slice.map((player) => presentPlayer(db, player, admin)),
      page.pagination,
    );
  },
  async getPlayer(id: string) {
    const db = readDb();
    const player = db.players.find((item) => item._id === id);
    if (!player) fail(404, "Player not found");
    if (!isAdmin() && player.status !== "active") fail(404, "Player not found");
    return ok("Player loaded", presentPlayer(db, player, isAdmin()));
  },
  async createPlayer(input: PlayerWrite) {
    requireAdmin();
    const db = readDb();
    const player = applyPlayer(db, input);
    db.players.push(player);
    commit(db);
    return ok("Player created", presentPlayer(db, player, true));
  },
  async updatePlayer(id: string, input: PlayerWrite) {
    requireAdmin();
    const db = readDb();
    const index = db.players.findIndex((player) => player._id === id);
    if (index < 0) fail(404, "Player not found");
    const player = applyPlayer(db, input, db.players[index]);
    db.players[index] = player;
    commit(db);
    return ok("Player updated", presentPlayer(db, player, true));
  },
  async deactivatePlayer(id: string) {
    requireAdmin();
    const db = readDb();
    const current = db.players.find((player) => player._id === id);
    if (!current) fail(404, "Player not found");
    return this.updatePlayer(id, { ...current, status: "inactive" });
  },
  async deletePlayer(id: string) {
    requireAdmin();
    const db = readDb();
    const used = db.matches.some((match) =>
      match.goals.some((item) => item.scorerRef === id || item.ownGoalPlayerRef === id),
    );
    if (used) {
      fail(422, "This player is named in a match. Deactivate the player, or edit those goals first.");
    }
    const before = db.players.length;
    db.players = db.players.filter((player) => player._id !== id);
    if (db.players.length === before) fail(404, "Player not found");
    commit(db);
    return ok("Player deleted", null);
  },
  async getTeams() {
    const db = readDb();
    const admin = isAdmin();
    const teams = db.teams.filter((team) => admin || team.status === "active").map(presentTeam);
    return ok("Teams loaded", teams);
  },
  async getTeam(id: string) {
    const db = readDb();
    const team = db.teams.find((item) => item._id === id);
    if (!team || (!isAdmin() && team.status !== "active")) fail(404, "Team not found");
    return ok("Team loaded", presentTeam(team));
  },
  async getAuctionSummary(): Promise<ReturnType<typeof ok<AuctionSummary>>> {
    const db = readDb();
    const activePlayers = db.players.filter((player) => player.status === "active");
    const teams: TeamAuctionCard[] = db.teams
      .filter((team) => team.status === "active")
      .map((team) => ({
        team: presentTeam(team),
        players: squadOf(db, team._id)
          .sort((a, b) => (a.jerseyNo ?? 99) - (b.jerseyNo ?? 99))
          .map((player) => presentPlayer(db, player, false) as PublicPlayer),
        stats: squadStats(db, team._id),
      }));
    const summary: AuctionSummary = {
      totals: {
        activeAuctionPlayers: activePlayers.length,
        pendingPlayers: activePlayers.filter((player) => player.auctionStatus === "pending").length,
        soldPlayers: db.players.filter((player) => player.auctionStatus === "sold").length,
        unsoldPlayers: activePlayers.filter((player) => player.auctionStatus === "unsold").length,
        totalAuctionSpend: db.players
          .filter((player) => player.auctionStatus === "sold")
          .reduce((sum, player) => sum + player.auctionPrice, 0),
        activeTeams: teams.length,
      },
      teams,
    };
    return ok("Auction summary loaded", summary);
  },
  async createTeam(input: TeamWrite) {
    requireAdmin();
    const db = readDb();
    if (db.teams.some((team) => team.name.toLowerCase() === input.name.trim().toLowerCase())) {
      fail(409, "A team with this name already exists", { name: "Team name must be unique" });
    }
    if (input.status === "active" && db.teams.filter((team) => team.status === "active").length >= db.settings.maxActiveTeams) {
      fail(422, `The active team limit is ${db.settings.maxActiveTeams}`, { status: "Deactivate another team first" });
    }
    const team: StoredTeam = {
      _id: uid("team"),
      name: input.name.trim(),
      shortName: input.shortName?.trim() || null,
      logo: input.logo ?? null,
      poster: input.poster ?? null,
      groupName: input.groupName?.trim() || null,
      status: input.status,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    db.teams.push(team);
    commit(db);
    return ok("Team created", presentTeam(team));
  },
  async updateTeam(id: string, input: TeamWrite) {
    requireAdmin();
    const db = readDb();
    const index = db.teams.findIndex((team) => team._id === id);
    if (index < 0) fail(404, "Team not found");
    if (db.teams.some((team) => team._id !== id && team.name.toLowerCase() === input.name.trim().toLowerCase())) {
      fail(409, "A team with this name already exists", { name: "Team name must be unique" });
    }
    const current = db.teams[index];
    if (
      input.status === "active" &&
      current.status !== "active" &&
      db.teams.filter((team) => team.status === "active").length >= db.settings.maxActiveTeams
    ) {
      fail(422, `The active team limit is ${db.settings.maxActiveTeams}`, { status: "Deactivate another team first" });
    }
    const team: StoredTeam = {
      ...current,
      name: input.name.trim(),
      shortName: input.shortName?.trim() || null,
      logo: input.logo === undefined ? current.logo : input.logo,
      poster: input.poster === undefined ? current.poster : input.poster,
      groupName: input.groupName?.trim() || null,
      status: input.status,
      updatedAt: new Date().toISOString(),
    };
    db.teams[index] = team;
    commit(db);
    return ok("Team updated", presentTeam(team));
  },
  async deleteTeam(id: string) {
    requireAdmin();
    const db = readDb();
    if (db.players.some((player) => player.teamRef === id)) {
      fail(422, "Reassign or remove this team's players before deleting it");
    }
    if (db.managers.some((manager) => manager.teamRef === id)) {
      fail(422, "Reassign this team's managers before deleting it");
    }
    if (db.matches.some((match) => match.team1Ref === id || match.team2Ref === id)) {
      fail(422, "Delete or edit the fixtures that use this team first");
    }
    const before = db.teams.length;
    db.teams = db.teams.filter((team) => team._id !== id);
    if (db.teams.length === before) fail(404, "Team not found");
    commit(db);
    return ok("Team deleted", null);
  },
  async getManagers(query: ManagerQuery = {}) {
    const db = readDb();
    const admin = isAdmin();
    let items = db.managers.filter((manager) => admin || manager.status === "active");
    if (query.search) {
      const needle = query.search.trim().toLowerCase();
      items = items.filter((manager) => manager.name.toLowerCase().includes(needle));
    }
    if (admin && query.status) items = items.filter((manager) => manager.status === query.status);
    if (query.teamRef) items = items.filter((manager) => manager.teamRef === query.teamRef);
    items.sort((a, b) => a.name.localeCompare(b.name));
    const page = paginate(items, query.page ?? 1, query.limit ?? 12);
    return ok(
      "Managers loaded",
      page.slice.map((manager) => presentManager(db, manager, admin)),
      page.pagination,
    );
  },
  async getManager(id: string) {
    const db = readDb();
    const manager = db.managers.find((item) => item._id === id);
    if (!manager || (!isAdmin() && manager.status !== "active")) fail(404, "Manager not found");
    return ok("Manager loaded", presentManager(db, manager, isAdmin()));
  },
  async saveManager(input: ManagerWrite, existing?: StoredManager) {
    const db = readDb();
    if (db.managers.some((manager) => manager.mobile === input.mobile && manager._id !== existing?._id)) {
      fail(409, "A manager with this mobile number already exists", { mobile: "This mobile number is already used" });
    }
    const email = input.email?.trim().toLowerCase() || null;
    if (email && db.managers.some((manager) => manager.email === email && manager._id !== existing?._id)) {
      fail(409, "A manager with this email already exists", { email: "This email is already used" });
    }
    if (input.teamRef && !db.teams.some((team) => team._id === input.teamRef)) {
      fail(422, "Choose a valid team", { teamRef: "That team does not exist" });
    }
    const manager: StoredManager = {
      _id: existing?._id ?? uid("manager"),
      name: input.name.trim(),
      mobile: input.mobile,
      email,
      dateOfBirth: input.dateOfBirth || null,
      teamRef: input.teamRef || null,
      role: input.role?.trim() || null,
      profilePic: input.profilePic === undefined ? existing?.profilePic ?? null : input.profilePic,
      status: input.status,
    };
    return manager;
  },
  async createManager(input: ManagerWrite) {
    requireAdmin();
    const db = readDb();
    const manager = await this.saveManager(input);
    db.managers.push(manager);
    commit(db);
    return ok("Manager created", presentManager(db, manager, true));
  },
  async updateManager(id: string, input: ManagerWrite) {
    requireAdmin();
    const db = readDb();
    const index = db.managers.findIndex((manager) => manager._id === id);
    if (index < 0) fail(404, "Manager not found");
    const manager = await this.saveManager(input, db.managers[index]);
    db.managers[index] = manager;
    commit(db);
    return ok("Manager updated", presentManager(db, manager, true));
  },
  async deleteManager(id: string) {
    requireAdmin();
    const db = readDb();
    const before = db.managers.length;
    db.managers = db.managers.filter((manager) => manager._id !== id);
    if (db.managers.length === before) fail(404, "Manager not found");
    commit(db);
    return ok("Manager deleted", null);
  },
  async getSponsors(query: SponsorQuery = {}) {
    const db = readDb();
    const admin = isAdmin();
    let items = db.sponsors.filter((sponsor) => admin || sponsor.status === "active");
    if (query.search) {
      const needle = query.search.trim().toLowerCase();
      items = items.filter((sponsor) => sponsor.name.toLowerCase().includes(needle));
    }
    if (admin && query.status) items = items.filter((sponsor) => sponsor.status === query.status);
    items.sort((a, b) => a.name.localeCompare(b.name));
    const page = paginate(items, query.page ?? 1, query.limit ?? 12);
    return ok(
      "Sponsors loaded",
      page.slice.map((sponsor) => presentSponsor(sponsor, admin)),
      page.pagination,
    );
  },
  async createSponsor(input: SponsorWrite) {
    requireAdmin();
    const db = readDb();
    const sponsor: StoredSponsor = {
      _id: uid("sponsor"),
      name: input.name.trim(),
      logo: input.logo ?? null,
      tier: input.tier?.trim() || null,
      website: input.website?.trim() || null,
      contactPerson: input.contactPerson?.trim() || null,
      contactMobile: input.contactMobile || null,
      notes: input.notes?.trim() || null,
      status: input.status,
    };
    db.sponsors.push(sponsor);
    commit(db);
    return ok("Sponsor created", presentSponsor(sponsor, true));
  },
  async updateSponsor(id: string, input: SponsorWrite) {
    requireAdmin();
    const db = readDb();
    const index = db.sponsors.findIndex((sponsor) => sponsor._id === id);
    if (index < 0) fail(404, "Sponsor not found");
    const current = db.sponsors[index];
    const sponsor: StoredSponsor = {
      ...current,
      name: input.name.trim(),
      logo: input.logo === undefined ? current.logo : input.logo,
      tier: input.tier?.trim() || null,
      website: input.website?.trim() || null,
      contactPerson: input.contactPerson?.trim() || null,
      contactMobile: input.contactMobile || null,
      notes: input.notes?.trim() || null,
      status: input.status,
    };
    db.sponsors[index] = sponsor;
    commit(db);
    return ok("Sponsor updated", presentSponsor(sponsor, true));
  },
  async deleteSponsor(id: string) {
    requireAdmin();
    const db = readDb();
    const before = db.sponsors.length;
    db.sponsors = db.sponsors.filter((sponsor) => sponsor._id !== id);
    if (db.sponsors.length === before) fail(404, "Sponsor not found");
    commit(db);
    return ok("Sponsor deleted", null);
  },
  async getMatches(query: MatchQuery = {}) {
    const db = readDb();
    let items = [...db.matches];
    if (query.stage) items = items.filter((match) => match.stage === query.stage);
    if (query.groupName) items = items.filter((match) => match.groupName === query.groupName);
    if (query.status) items = items.filter((match) => match.status === query.status);
    if (query.search) {
      const needle = query.search.trim().toLowerCase();
      items = items.filter((match) => {
        const home = db.teams.find((team) => team._id === match.team1Ref)?.name ?? "";
        const away = db.teams.find((team) => team._id === match.team2Ref)?.name ?? "";
        return (
          match.matchNo.toLowerCase().includes(needle) ||
          home.toLowerCase().includes(needle) ||
          away.toLowerCase().includes(needle)
        );
      });
    }
    items.sort((a, b) => new Date(a.kickoffAt).getTime() - new Date(b.kickoffAt).getTime());
    const page = paginate(items, query.page ?? 1, query.limit ?? 8);
    return ok(
      "Matches loaded",
      page.slice.map((match) => presentMatch(db, match)),
      page.pagination,
    );
  },
  async getMatch(id: string) {
    const db = readDb();
    const match = db.matches.find((item) => item._id === id);
    if (!match) fail(404, "Match not found");
    return ok("Match loaded", presentMatch(db, match));
  },
  async createMatch(input: MatchWrite) {
    requireAdmin();
    const db = readDb();
    const match = applyMatch(db, input);
    db.matches.push(match);
    commit(db);
    return ok("Fixture created", presentMatch(db, match));
  },
  async updateMatch(id: string, input: MatchWrite) {
    requireAdmin();
    const db = readDb();
    const index = db.matches.findIndex((match) => match._id === id);
    if (index < 0) fail(404, "Match not found");
    const match = applyMatch(db, input, db.matches[index]);
    db.matches[index] = match;
    commit(db);
    return ok("Fixture updated", presentMatch(db, match));
  },
  async deleteMatch(id: string) {
    requireAdmin();
    const db = readDb();
    const before = db.matches.length;
    db.matches = db.matches.filter((match) => match._id !== id);
    if (db.matches.length === before) fail(404, "Match not found");
    commit(db);
    return ok("Fixture deleted", null);
  },
  async addGoal(matchId: string, input: GoalWrite) {
    requireAdmin();
    const db = readDb();
    const match = db.matches.find((item) => item._id === matchId);
    if (!match) fail(404, "Match not found");
    const refs = validateGoal(db, match, input);
    const item: StoredGoal = {
      _id: uid("goal"),
      scoringTeamRef: input.scoringTeamRef,
      goalType: input.goalType,
      ...refs,
      createdAt: new Date().toISOString(),
    };
    match.goals.push(item);
    match.updatedAt = new Date().toISOString();
    validateShootout(match);
    commit(db);
    return ok("Goal added", presentMatch(db, match));
  },
  async updateGoal(matchId: string, goalId: string, input: GoalWrite) {
    requireAdmin();
    const db = readDb();
    const match = db.matches.find((item) => item._id === matchId);
    if (!match) fail(404, "Match not found");
    const index = match.goals.findIndex((item) => item._id === goalId);
    if (index < 0) fail(404, "Goal not found");
    const refs = validateGoal(db, match, input);
    match.goals[index] = {
      ...match.goals[index],
      scoringTeamRef: input.scoringTeamRef,
      goalType: input.goalType,
      ...refs,
    };
    match.updatedAt = new Date().toISOString();
    validateShootout(match);
    commit(db);
    return ok("Goal updated", presentMatch(db, match));
  },
  async deleteGoal(matchId: string, goalId: string) {
    requireAdmin();
    const db = readDb();
    const match = db.matches.find((item) => item._id === matchId);
    if (!match) fail(404, "Match not found");
    const before = match.goals.length;
    match.goals = match.goals.filter((item) => item._id !== goalId);
    if (match.goals.length === before) fail(404, "Goal not found");
    match.updatedAt = new Date().toISOString();
    validateShootout(match);
    commit(db);
    return ok("Goal removed", presentMatch(db, match));
  },
  async getStandings() {
    return ok("Standings loaded", buildStandings(readDb()));
  },
  async getTopScorers() {
    return ok("Top scorers loaded", topScorers(readDb()));
  },
  async getTeamStatistics(teamId: string) {
    const db = readDb();
    const team = db.teams.find((item) => item._id === teamId);
    if (!team) fail(404, "Team not found");
    const standing = buildStandings(db)
      .flatMap((group) => group.rows)
      .find((row) => row.team._id === teamId);
    const overall = teamGoalTotals(db).get(teamId) ?? { scored: 0, conceded: 0, cleanSheets: 0 };
    const played = db.matches.filter(
      (match) => match.status === "completed" && (match.team1Ref === teamId || match.team2Ref === teamId),
    ).length;
    const group: TeamStatistics["group"] = standing
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
      : { played: 0, won: 0, drawn: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, goalDifference: 0, points: 0 };
    const stats: TeamStatistics = {
      team: briefTeam(team),
      group,
      overall: { played, goalsFor: overall.scored, goalsAgainst: overall.conceded, cleanSheets: overall.cleanSheets },
    };
    return ok("Team statistics loaded", stats);
  },
  async getDashboard(): Promise<ReturnType<typeof ok<DashboardSummary>>> {
    const db = readDb();
    const auction = (await this.getAuctionSummary()).data;
    const scorers = topScorers(db);
    const totals = teamGoalTotals(db);
    const completed = db.matches.filter((match) => match.status === "completed");
    const ranked = db.teams
      .map((team) => ({ team: briefTeam(team), ...(totals.get(team._id) ?? { scored: 0, conceded: 0, cleanSheets: 0 }) }))
      .filter((row) => row.scored + row.conceded + row.cleanSheets > 0);
    const mostScoring = [...ranked].sort((a, b) => b.scored - a.scored || a.team.name.localeCompare(b.team.name))[0];
    const mostConceding = [...ranked].sort((a, b) => b.conceded - a.conceded || a.team.name.localeCompare(b.team.name))[0];
    const bestClean = ranked.reduce((max, row) => Math.max(max, row.cleanSheets), 0);
    const alerts: string[] = [];
    for (const card of auction.teams) {
      if (card.stats.playerCount < card.stats.maxPlayers) {
        alerts.push(`${card.team.name} has ${card.stats.remainingSlots} squad place${card.stats.remainingSlots === 1 ? "" : "s"} left`);
      }
      if (card.stats.playerCount > 0 && card.stats.iconPlayerCount < card.stats.requiredIcons) {
        alerts.push(`${card.team.name} is missing an icon player`);
      }
      if (card.stats.playerCount > 0 && card.stats.goalkeeperCount < card.stats.requiredGoalkeepers) {
        alerts.push(`${card.team.name} is missing a goalkeeper`);
      }
    }
    const live = db.matches.filter((match) => match.status === "live").length;
    if (live) alerts.push(`${live} match${live === 1 ? " is" : "es are"} live`);
    const summary: DashboardSummary = {
      tournamentName: db.settings.tournamentName,
      startDate: db.settings.startDate,
      endDate: db.settings.endDate,
      totalMatchesPlayed: completed.length,
      totalGoals: completed.reduce((sum, match) => sum + match.goals.length, 0),
      activeTeams: auction.totals.activeTeams,
      activePlayers: auction.totals.activeAuctionPlayers,
      pendingPlayers: auction.totals.pendingPlayers,
      soldPlayers: auction.totals.soldPlayers,
      unsoldPlayers: auction.totals.unsoldPlayers,
      totalAuctionSpend: auction.totals.totalAuctionSpend,
      upcomingMatchCount: db.matches.filter((match) => match.status === "scheduled").length,
      topScorer: scorers[0] ?? null,
      mostScoringTeam: mostScoring ? { team: mostScoring.team, goals: mostScoring.scored } : null,
      mostConcedingTeam: mostConceding ? { team: mostConceding.team, goals: mostConceding.conceded } : null,
      mostCleanSheets: ranked
        .filter((row) => row.cleanSheets === bestClean && bestClean > 0)
        .map((row) => ({ team: row.team, cleanSheets: row.cleanSheets })),
      upcomingFixtures: db.matches
        .filter((match) => match.status === "scheduled")
        .sort((a, b) => new Date(a.kickoffAt).getTime() - new Date(b.kickoffAt).getTime())
        .slice(0, 4)
        .map((match) => presentMatch(db, match)),
      recentResults: completed
        .sort((a, b) => new Date(b.kickoffAt).getTime() - new Date(a.kickoffAt).getTime())
        .slice(0, 4)
        .map((match) => presentMatch(db, match)),
      alerts,
    };
    return ok("Dashboard loaded", summary);
  },
};

export const PREVIEW_LOGIN = { email: PREVIEW_EMAIL, password: PREVIEW_PASSWORD };
