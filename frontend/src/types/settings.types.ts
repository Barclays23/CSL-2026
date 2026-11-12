export interface PointsRule { win: number; draw: number; loss: number; }
export type AuctionState = "not_started" | "in_progress" | "completed";
export interface Settings { _id: string; singletonKey: "CSL_CURRENT"; tournamentName: string; startDate: string; endDate: string; maxActivePlayers: number; maxActiveTeams: number; maxPlayersPerTeam: number; auctionBudgetPerTeam: number; requiredIconPlayers: number; requiredGoalkeepers: number; pointsRule: PointsRule; auctionState: AuctionState; auctionCompletedAt: string | null; updatedAt: string; }
export type SettingsUpdate = Partial<Omit<Settings, "_id" | "singletonKey" | "updatedAt">>;
