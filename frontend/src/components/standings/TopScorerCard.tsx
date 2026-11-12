import { Link } from "@tanstack/react-router";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { GlassCard } from "@/components/ui/GlassCard";
import type { TopScorer } from "@/types/statistics.types";

export function TopScorerCard({ scorer }: { scorer: TopScorer }) {
  return (
    <Link to="/players/$playerId" params={{ playerId: scorer.player._id }}>
      <GlassCard className="flex items-center gap-3 p-3">
        <span className="w-6 font-display text-2xl text-gold">{scorer.rank}</span>
        <Avatar name={scorer.player.name} asset={scorer.player.profilePic} />
        <div className="min-w-0 flex-1">
          <p className="truncate font-semibold text-fg">{scorer.player.name}</p>
          <p className="truncate text-xs text-muted">{scorer.team?.name ?? "Unassigned"}</p>
        </div>
        <Badge tone="accent">{scorer.goals}</Badge>
      </GlassCard>
    </Link>
  );
}
