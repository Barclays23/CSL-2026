import { Link } from "@tanstack/react-router";
import { PageContainer } from "@/components/layout/PageContainer";
import { PlayerCard } from "@/components/players/PlayerCard";
import { Badge } from "@/components/ui/Badge";
import { ErrorState } from "@/components/ui/ErrorState";
import { GlassCard } from "@/components/ui/GlassCard";
import { Skeleton } from "@/components/ui/Skeleton";
import { StatCard } from "@/components/ui/StatCard";
import { useServiceQuery } from "@/hooks/useServiceQuery";
import { getPlayers } from "@/services/playerService";
import { getTeamById, getTeamStatistics } from "@/services/teamService";

export function TeamDetailsPage({ teamId }: { teamId: string }) {
  const team = useServiceQuery(() => getTeamById(teamId), [teamId]);
  const stats = useServiceQuery(() => getTeamStatistics(teamId), [teamId]);
  const players = useServiceQuery(() => getPlayers({ teamRef: teamId, limit: 20 }), [teamId]);
  const record = team.data?.data;

  if (team.loading) {
    return <PageContainer><Skeleton className="h-64" /></PageContainer>;
  }
  if (team.error || !record) {
    return <PageContainer><ErrorState message={team.error || "Team not found"} onRetry={team.reload} /></PageContainer>;
  }

  const group = stats.data?.data.group;
  const overall = stats.data?.data.overall;

  return (
    <PageContainer>
      <Link to="/teams" className="text-sm font-semibold text-accent">Back to teams</Link>
      <GlassCard className="mt-4 overflow-hidden">
        {record.poster ? <img src={record.poster.url} alt="" className="h-48 w-full object-cover" /> : null}
        <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center">
          {record.logo ? <img src={record.logo.url} alt="" className="h-20 w-20 rounded-2xl object-cover" /> : null}
          <div>
            <h1 className="font-display text-5xl text-fg">{record.name}</h1>
            <div className="mt-2 flex gap-2">
              {record.shortName ? <Badge>{record.shortName}</Badge> : null}
              {record.groupName ? <Badge tone="accent">{record.groupName}</Badge> : null}
            </div>
          </div>
        </div>
      </GlassCard>
      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Played" value={group?.played ?? 0} hint="Group stage" />
        <StatCard label="Points" value={group?.points ?? 0} />
        <StatCard label="Goal difference" value={group?.goalDifference ?? 0} />
        <StatCard label="Clean sheets" value={overall?.cleanSheets ?? 0} hint="All completed matches" />
      </div>
      <h2 className="mb-3 mt-8 font-display text-3xl text-fg">Squad</h2>
      <div className="grid grid-cols-1 gap-3 min-[420px]:grid-cols-2 lg:grid-cols-3">
        {players.data?.data.map((player) => <PlayerCard key={player._id} player={player} />)}
      </div>
    </PageContainer>
  );
}
