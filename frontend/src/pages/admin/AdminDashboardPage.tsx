import { Link } from "@tanstack/react-router";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";
import { FixtureCard } from "@/components/matches/FixtureCard";
import { Button } from "@/components/ui/Button";
import { ErrorState } from "@/components/ui/ErrorState";
import { GlassCard } from "@/components/ui/GlassCard";
import { StatCard } from "@/components/ui/StatCard";
import { AdminRoute } from "@/components/auth/AdminRoute";
import { useServiceQuery } from "@/hooks/useServiceQuery";
import { getDashboardSummary } from "@/services/statisticsService";
import { formatCurrency } from "@/utils/formatCurrency";
import { formatDateRange } from "@/utils/formatDate";

export function AdminDashboardPage() {
  return (
    <AdminRoute>
      <DashboardBody />
    </AdminRoute>
  );
}

function DashboardBody() {
  const dashboard = useServiceQuery(() => getDashboardSummary(), []);
  const data = dashboard.data?.data;
  return (
    <PageContainer>
      <PageHeader
        eyebrow="Admin"
        title={data?.tournamentName ?? "Dashboard"}
        description={data ? formatDateRange(data.startDate, data.endDate) : "Tournament controls for the current event."}
      />
      {dashboard.error ? <ErrorState message={dashboard.error} onRetry={dashboard.reload} /> : null}
      {data ? (
        <>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard label="Active players" value={data.activePlayers} />
            <StatCard label="Active teams" value={data.activeTeams} />
            <StatCard label="Pending" value={data.pendingPlayers} />
            <StatCard label="Sold" value={data.soldPlayers} />
            <StatCard label="Unsold" value={data.unsoldPlayers} />
            <StatCard label="Auction spend" value={formatCurrency(data.totalAuctionSpend)} />
            <StatCard label="Matches played" value={data.totalMatchesPlayed} />
            <StatCard label="Upcoming" value={data.upcomingMatchCount} />
            <StatCard label="Goals" value={data.totalGoals} />
          </div>
          <div className="mt-6 flex flex-wrap gap-2">
            <Link to="/players"><Button size="sm">Add player</Button></Link>
            <Link to="/teams"><Button size="sm" variant="surface">Add team</Button></Link>
            <Link to="/managers"><Button size="sm" variant="surface">Add manager</Button></Link>
            <Link to="/sponsors"><Button size="sm" variant="surface">Add sponsor</Button></Link>
            <Link to="/matches"><Button size="sm" variant="surface">Create fixture</Button></Link>
            <Link to="/admin/settings"><Button size="sm" variant="gold">Settings</Button></Link>
          </div>
          {data.alerts.length ? (
            <GlassCard className="mt-6 p-4">
              <h2 className="font-display text-2xl text-fg">Needs attention</h2>
              <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-muted">
                {data.alerts.map((alert) => <li key={alert}>{alert}</li>)}
              </ul>
            </GlassCard>
          ) : null}
          <h2 className="mb-3 mt-8 font-display text-3xl text-fg">Latest results</h2>
          <div className="grid gap-3 lg:grid-cols-2">
            {data.recentResults.map((match) => <FixtureCard key={match._id} match={match} />)}
          </div>
        </>
      ) : null}
    </PageContainer>
  );
}
