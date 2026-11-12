import type { MatchStage, MatchStatus } from "@/types/match.types";
import type { AuctionStatus, PlayerStatus, Position } from "@/types/player.types";

export const POSITIONS: { value: Position; label: string }[] = [
  { value: "GK", label: "Goalkeeper" },
  { value: "DF", label: "Defender" },
  { value: "MF", label: "Midfielder" },
  { value: "FW", label: "Forward" },
];

export const POSITION_LABEL: Record<Position, string> = {
  GK: "Goalkeeper",
  DF: "Defender",
  MF: "Midfielder",
  FW: "Forward",
};

export const AUCTION_STATUSES: { value: AuctionStatus; label: string }[] = [
  { value: "pending", label: "Pending" },
  { value: "sold", label: "Sold" },
  { value: "unsold", label: "Unsold" },
];

export const PLAYER_STATUSES: { value: PlayerStatus; label: string }[] = [
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
];

export const STAGES: { value: MatchStage; label: string }[] = [
  { value: "group", label: "Group" },
  { value: "quarter_final", label: "Quarter-final" },
  { value: "semi_final", label: "Semi-final" },
  { value: "final", label: "Final" },
];

export const STAGE_LABEL: Record<MatchStage, string> = {
  group: "Group",
  quarter_final: "Quarter-final",
  semi_final: "Semi-final",
  final: "Final",
};

export const MATCH_STATUSES: { value: MatchStatus; label: string }[] = [
  { value: "scheduled", label: "Upcoming" },
  { value: "live", label: "Live" },
  { value: "completed", label: "Completed" },
  { value: "postponed", label: "Postponed" },
  { value: "cancelled", label: "Cancelled" },
];

export const STATUS_LABEL: Record<MatchStatus, string> = {
  scheduled: "Upcoming",
  live: "Live",
  completed: "Full time",
  postponed: "Postponed",
  cancelled: "Cancelled",
};

export const KNOCKOUT_STAGES: MatchStage[] = ["quarter_final", "semi_final", "final"];

export function isKnockout(stage: MatchStage) {
  return KNOCKOUT_STAGES.includes(stage);
}
