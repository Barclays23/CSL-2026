import type { AdminUser } from "@/types/auth.types";
import type { Asset } from "@/types/api.types";
import type { GoalType, MatchStage, MatchStatus, PenaltyShootout } from "@/types/match.types";
import type { AuctionStatus, PlayerStatus, Position } from "@/types/player.types";
import type { Settings } from "@/types/settings.types";
import type { SponsorStatus } from "@/types/sponsor.types";
import type { TeamStatus } from "@/types/team.types";
import { ApiError } from "@/utils/errorHandler";
import { createSeed } from "@/mocks/seed";

export interface StoredPlayer {
  _id: string;
  name: string;
  mobile: string;
  email: string | null;
  dateOfBirth: string | null;
  position: Position;
  isIconPlayer: boolean;
  teamRef: string | null;
  jerseyNo: number | null;
  auctionPrice: number;
  auctionStatus: AuctionStatus;
  status: PlayerStatus;
  profilePic: Asset | null;
}

export interface StoredManager {
  _id: string;
  name: string;
  mobile: string;
  email: string | null;
  dateOfBirth: string | null;
  teamRef: string | null;
  role: string | null;
  profilePic: Asset | null;
  status: "active" | "inactive";
}

export interface StoredSponsor {
  _id: string;
  name: string;
  logo: Asset | null;
  tier: string | null;
  website: string | null;
  contactPerson: string | null;
  contactMobile: string | null;
  notes: string | null;
  status: SponsorStatus;
}

export interface StoredGoal {
  _id: string;
  scoringTeamRef: string;
  goalType: GoalType;
  scorerRef: string | null;
  ownGoalPlayerRef: string | null;
  createdAt: string;
}

export interface StoredMatch {
  _id: string;
  matchNo: string;
  stage: MatchStage;
  groupName: string | null;
  kickoffAt: string;
  venue: string | null;
  team1Ref: string;
  team2Ref: string;
  status: MatchStatus;
  goals: StoredGoal[];
  penaltyShootout: PenaltyShootout | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface StoredTeam {
  _id: string;
  name: string;
  shortName: string | null;
  logo: Asset | null;
  poster: Asset | null;
  groupName: string | null;
  status: TeamStatus;
  createdAt: string;
  updatedAt: string;
}

export interface Database {
  settings: Settings;
  user: AdminUser;
  players: StoredPlayer[];
  teams: StoredTeam[];
  managers: StoredManager[];
  sponsors: StoredSponsor[];
  matches: StoredMatch[];
}

const DB_KEY = "csl-preview-db-v1";
const SESSION_KEY = "csl-preview-admin";

let memory: Database | null = null;

function loadStored() {
  if (memory) return memory;
  if (typeof window === "undefined") {
    memory = createSeed();
    return memory;
  }
  try {
    const raw = localStorage.getItem(DB_KEY);
    if (raw) {
      memory = JSON.parse(raw) as Database;
      return memory;
    }
  } catch {
    memory = null;
  }
  memory = createSeed();
  localStorage.setItem(DB_KEY, JSON.stringify(memory));
  return memory;
}

export function readDb() {
  return structuredClone(loadStored());
}

export function commit(db: Database) {
  memory = db;
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(DB_KEY, JSON.stringify(db));
  } catch {
    throw new ApiError(422, "Preview storage is full. Remove a large image or reset the sample data.");
  }
}

export function resetPreviewData() {
  memory = createSeed();
  if (typeof window !== "undefined") {
    localStorage.setItem(DB_KEY, JSON.stringify(memory));
  }
  return memory;
}

export function readSession(): AdminUser | null {
  if (typeof window === "undefined") return null;
  const raw = sessionStorage.getItem(SESSION_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AdminUser;
  } catch {
    return null;
  }
}

export function writeSession(user: AdminUser | null) {
  if (typeof window === "undefined") return;
  if (!user) sessionStorage.removeItem(SESSION_KEY);
  else sessionStorage.setItem(SESSION_KEY, JSON.stringify(user));
}

export function isAdmin() {
  const session = readSession();
  if (!session) return false;
  const user = loadStored().user;
  return user.status === "active" && session._id === user._id;
}

export function requireAdmin() {
  if (!isAdmin()) {
    throw new ApiError(401, "Admin login is required for this change", { errorCode: "UNAUTHORIZED" });
  }
}

export function uid(prefix: string) {
  const id = globalThis.crypto?.randomUUID?.() ?? Math.random().toString(36).slice(2, 10);
  return `${prefix}-${id}`;
}
