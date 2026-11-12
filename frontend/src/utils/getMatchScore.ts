import type { Match } from "@/types/match.types";
import { refId } from "@/utils/refs";

export interface MatchScore {
  team1: number;
  team2: number;
  tied: boolean;
}

export function getMatchScore(match: Pick<Match, "team1Ref" | "team2Ref" | "goals">): MatchScore {
  const team1Id = refId(match.team1Ref);
  const team2Id = refId(match.team2Ref);
  let team1 = 0;
  let team2 = 0;
  for (const goal of match.goals) {
    const scoringId = refId(goal.scoringTeamRef);
    if (scoringId === team1Id) team1 += 1;
    else if (scoringId === team2Id) team2 += 1;
  }
  return { team1, team2, tied: team1 === team2 };
}

export function shootoutWinner(match: Pick<Match, "team1Ref" | "team2Ref" | "penaltyShootout">) {
  const shootout = match.penaltyShootout;
  if (!shootout || shootout.team1Score === shootout.team2Score) return null;
  return shootout.team1Score > shootout.team2Score ? refId(match.team1Ref) : refId(match.team2Ref);
}
