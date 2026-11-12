import { Link } from "@tanstack/react-router";
import { CalendarRange, Shield, Sparkles, Swords, Trophy, Users } from "lucide-react";
import { PageContainer } from "@/components/layout/PageContainer";
import { FixtureCard } from "@/components/matches/FixtureCard";
import { SponsorCard } from "@/components/sponsors/SponsorCard";
import { TopScorerCard } from "@/components/standings/TopScorerCard";
import { Button } from "@/components/ui/Button";
import { ErrorState } from "@/components/ui/ErrorState";
import { GlassCard } from "@/components/ui/GlassCard";
import { Skeleton } from "@/components/ui/Skeleton";
import { StatCard } from "@/components/ui/StatCard";
import { useAuth } from "@/contexts/AuthContext";
import { useServiceQuery } from "@/hooks/useServiceQuery";
import { getSponsors } from "@/services/sponsorService";
import { getDashboardSummary, getTopScorers } from "@/services/statisticsService";
import { formatDateRange } from "@/utils/formatDate";

export function HomePage() {
  const { isAuthenticated } = useAuth();
  const dashboard = useServiceQuery(() => getDashboardSummary(), []);
  const scorers = useServiceQuery(() => getTopScorers(), []);
  const sponsors = useServiceQuery(() => getSponsors({ limit: 8 }), []);
  const data = dashboard.data?.data;

  return (
    <div>
      <PageContainer className="pb-4">
        <section className="relative overflow-hidden rounded-card border border-line">
          <div className="pitch-stripes absolute inset-0" />
          <div className="pitch-lines absolute inset-0" />
          <div className="absolute inset-0 bg-gradient-to-r from-bg via-bg/85 to-bg/25" />
          <div className="relative grid gap-8 p-6 sm:p-10 lg:grid-cols-[1.4fr_0.8fr] lg:items-end">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-accent">Village football</p>
              <h1 className="mt-3 max-w-xl font-display text-5xl leading-none text-fg sm:text-7xl">
                {data?.tournamentName ?? "CSL Football Tournament"}
              </h1>
              <p className="mt-4 max-w-lg text-sm text-fg/90">
                Six teams, one ground, and a running record of the auction, the goals and the table.
              </p>
              <p className="mt-3 inline-flex items-center gap-2 text-sm text-gold">
                <CalendarRange className="h-4 w-4" />
                {data ? formatDateRange(data.startDate, data.endDate) : "Dates loading"}
              </p>
              <div className="mt-6 flex flex-wrap gap-2">
                <Link to="/teams">
                  <Button variant="accent">View teams</Button>
                </Link>
                <Link to="/matches">
                  <Button variant="surface">Fixtures</Button>
                </Link>
              </div>
            </div>
            <GlassCard className="p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted">Next kick-off</p>
              <div className="mt-3">
                {dashboard.loading ? <Skeleton className="h-28" /> : null}
                {data?.upcomingFixtures[0] ? <FixtureCard match={data.upcomingFixtures[0]} /> : null}
                {data && !data.upcomingFixtures[0] ? <p className="text-sm text-muted">No upcoming fixtures.</p> : null}
              </div>
            </GlassCard>
          </div>
        </section>
      </PageContainer>

      <PageContainer>
        {isAuthenticated ? (
          <GlassCard className="mb-6 flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-fg">You are managing this tournament.</p>
            <div className="flex flex-wrap gap-2">
              <Link to="/admin/dashboard">
                <Button size="sm">Dashboard</Button>
              </Link>
              <Link to="/admin/settings">
                <Button size="sm" variant="surface">
                  Settings
                </Button>
              </Link>
            </div>
          </GlassCard>
        ) : null}

        {dashboard.error ? <ErrorState message={dashboard.error} onRetry={dashboard.reload} /> : null}
        {dashboard.loading ? (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={index} className="h-28" />
            ))}
          </div>
        ) : null}
        {data ? (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard icon={Swords} label="Matches played" value={data.totalMatchesPlayed} />
            <StatCard icon={Sparkles} label="Goals" value={data.totalGoals} hint="Normal goals and own goals" />
            <StatCard icon={Shield} label="Active teams" value={data.activeTeams} />
            <StatCard icon={Users} label="Active players" value={data.activePlayers} />
            <StatCard icon={Trophy} label="Top scorer" value={data.topScorer?.player.name ?? "—"} hint={data.topScorer ? `${data.topScorer.goals} goals` : "No goals yet"} />
            <StatCard label="Most scoring" value={data.mostScoringTeam?.team.shortName ?? data.mostScoringTeam?.team.name ?? "—"} hint={data.mostScoringTeam ? `${data.mostScoringTeam.goals} goals` : undefined} />
            <StatCard label="Most conceded" value={data.mostConcedingTeam?.team.shortName ?? "—"} hint={data.mostConcedingTeam ? `${data.mostConcedingTeam.goals} against` : undefined} />
            <StatCard label="Clean sheets" value={data.mostCleanSheets[0]?.team.shortName ?? "—"} hint={data.mostCleanSheets[0] ? `${data.mostCleanSheets[0].cleanSheets} shutouts` : "None yet"} />
          </div>
        ) : null}

        <div className="mt-10 grid gap-8 lg:grid-cols-2">
          <section>
            <h2 className="mb-4 font-display text-3xl text-fg">Upcoming</h2>
            <div className="grid gap-3">
              {data?.upcomingFixtures.length ? data.upcomingFixtures.map((match) => <FixtureCard key={match._id} match={match} />) : <p className="text-sm text-muted">Nothing scheduled.</p>}
            </div>
          </section>
          <section>
            <h2 className="mb-4 font-display text-3xl text-fg">Recent results</h2>
            <div className="grid gap-3">
              {data?.recentResults.length ? data.recentResults.map((match) => <FixtureCard key={match._id} match={match} />) : <p className="text-sm text-muted">No completed matches yet.</p>}
            </div>
          </section>
        </div>

        <section className="mt-10">
          <div className="mb-4 flex items-end justify-between">
            <h2 className="font-display text-3xl text-fg">Top scorers</h2>
            <Link to="/standings" className="text-sm font-semibold text-accent">
              Full table
            </Link>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {scorers.data?.data.slice(0, 5).map((scorer) => <TopScorerCard key={scorer.player._id} scorer={scorer} />)}
          </div>
        </section>

        <section className="mt-10">
          <h2 className="mb-4 font-display text-3xl text-fg">Sponsors</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {sponsors.data?.data.filter((sponsor) => sponsor.status === "active").map((sponsor) => (
              <SponsorCard key={sponsor._id} sponsor={sponsor} />
            ))}
          </div>
        </section>
      </PageContainer>
    </div>
  );
}
