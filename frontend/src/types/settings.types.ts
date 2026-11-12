export interface PointsRule {
  win: number;
  draw: number;
  loss: number;
}

export interface Settings {
  _id: string;
  singletonKey: "CSL_CURRENT";
  tournamentName: string;
  startDate: string;
  endDate: string;
  maxActivePlayers: number;
  maxActiveTeams: number;
  maxPlayersPerTeam: number;
  auctionBudgetPerTeam: number;
  requiredIconPlayers: number;
  requiredGoalkeepers: number;
  pointsRule: PointsRule;
  updatedAt: string;
}

export type SettingsUpdate = Omit<Settings, "_id" | "singletonKey" | "updatedAt">;
