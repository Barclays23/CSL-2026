export interface PointsRule {win:number;draw:number;loss:number;}
export type AuctionState="not_started"|"in_progress"|"completed";
export interface SettingsFields {
  singletonKey:"CSL_CURRENT";tournamentName:string;startDate:Date;endDate:Date;maxActivePlayers:number;
  maxActiveTeams:number;maxPlayersPerTeam:number;auctionBudgetPerTeam:number;requiredIconPlayers:number;
  requiredGoalkeepers:number;pointsRule:PointsRule;auctionState:AuctionState;auctionCompletedAt:Date|null;
}
