export type AuctionState="not_started"|"in_progress"|"completed";
export interface AuctionTeamValidation {
  team:string;
  message:string;
}
export interface AuctionTotals {
  activeAuctionPlayers:number;
  pendingPlayers:number;
  soldPlayers:number;
  unsoldPlayers:number;
  totalAuctionSpend:number;
  activeTeams:number;
}
