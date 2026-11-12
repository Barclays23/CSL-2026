import { Link } from "@tanstack/react-router";
import { Avatar } from "@/components/ui/Avatar";
import { GlassCard } from "@/components/ui/GlassCard";
import { ScoreDisplay, teamLogo, teamName } from "@/components/matches/ScoreDisplay";
import type { Match } from "@/types/match.types";
import { formatDate, formatTime } from "@/utils/formatDate";

export function FixtureCard({ match }: { match: Match }) {
  return (
    <Link to="/matches/$matchId" params={{ matchId: match._id }} className="block">
      <GlassCard className="p-4 transition duration-200 hover:border-accent">
        <div className="grid grid-cols-[auto_1fr_auto] items-center gap-3">
          <Avatar name={teamName(match.team1Ref)} asset={teamLogo(match.team1Ref)} className="h-12 w-12 rounded-xl" />
          <ScoreDisplay match={match} />
          <Avatar name={teamName(match.team2Ref)} asset={teamLogo(match.team2Ref)} className="h-12 w-12 rounded-xl" />
        </div>
        <p className="mt-3 text-center text-xs text-muted">
          {formatDate(match.kickoffAt)} · {formatTime(match.kickoffAt)}
          {match.venue ? ` · ${match.venue}` : ""}
        </p>
      </GlassCard>
    </Link>
  );
}
