import { Link } from "@tanstack/react-router";
import { Star } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { GlassCard } from "@/components/ui/GlassCard";
import type { PublicPlayer } from "@/types/player.types";
import { formatCurrency } from "@/utils/formatCurrency";

export function PlayerCard({ player }: { player: PublicPlayer }) {
  return (
    <Link to="/players/$playerId" params={{ playerId: player._id }} className="block">
      <GlassCard className="h-full p-3 transition duration-200 hover:-translate-y-0.5 hover:border-accent">
        <div className="flex items-center gap-3">
          <Avatar name={player.name} asset={player.profilePic} />
          <div className="min-w-0">
            <p className="truncate font-semibold text-fg">{player.name}</p>
            <p className="text-xs text-muted">
              {player.jerseyNo ? `#${player.jerseyNo}` : "No shirt"} · {player.team?.shortName || player.team?.name || "Unassigned"}
            </p>
          </div>
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <Badge tone="primary">{player.position}</Badge>
          {player.isIconPlayer ? (
            <Badge tone="gold">
              <Star className="mr-1 h-3 w-3" /> Icon
            </Badge>
          ) : null}
          <span className="ml-auto text-sm font-semibold tabular text-fg">{formatCurrency(player.auctionPrice)}</span>
        </div>
      </GlassCard>
    </Link>
  );
}
