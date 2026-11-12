export type AuctionState = "not_started" | "in_progress" | "completed";
export interface AuctionValidationIssue { scope: string; message: string; }
export interface AuctionCompletionResult { auctionState: "completed"; auctionCompletedAt: Date; }
export interface AuctionStartResult { auctionState: "in_progress"; auctionCompletedAt: null; }
export interface AuctionCompletionSummary {
  activeAuctionPlayers: number; pendingPlayers: number; soldPlayers: number; unsoldPlayers: number;
  totalAuctionSpend: number; activeTeams: number;
}
