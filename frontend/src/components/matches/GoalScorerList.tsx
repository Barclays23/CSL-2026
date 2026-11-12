import { Badge } from "@/components/ui/Badge";
import type { Match } from "@/types/match.types";
import { isPopulated } from "@/utils/refs";

export function GoalScorerList({ match }: { match: Match }) {
  if (!match.goals.length) {
    return <p className="text-sm text-muted">No goals recorded.</p>;
  }
  return (
    <ul className="flex flex-col gap-2">
      {match.goals.map((goal) => {
        const team = isPopulated(goal.scoringTeamRef) ? goal.scoringTeamRef.name : "Team";
        const scorer = goal.scorerRef && isPopulated(goal.scorerRef) ? goal.scorerRef.name : null;
        const own = goal.ownGoalPlayerRef && isPopulated(goal.ownGoalPlayerRef) ? goal.ownGoalPlayerRef.name : null;
        return (
          <li key={goal._id} className="flex items-center justify-between gap-3 rounded-control border border-line bg-glass px-3 py-2">
            <div>
              <p className="text-sm font-semibold text-fg">{goal.goalType === "own_goal" ? own || "Own goal" : scorer || "Scorer not recorded"}</p>
              <p className="text-xs text-muted">{team}</p>
            </div>
            <Badge tone={goal.goalType === "own_goal" ? "gold" : "primary"}>{goal.goalType === "own_goal" ? "Own goal" : "Goal"}</Badge>
          </li>
        );
      })}
    </ul>
  );
}
