import { useState } from "react";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";
import { StandingsTable } from "@/components/standings/StandingsTable";
import { TopScorerCard } from "@/components/standings/TopScorerCard";
import { ErrorState } from "@/components/ui/ErrorState";
import { GlassCard } from "@/components/ui/GlassCard";
import { Skeleton } from "@/components/ui/Skeleton";
import { Tabs } from "@/components/ui/Tabs";
import { useServiceQuery } from "@/hooks/useServiceQuery";
import { getStandings, getTopScorers } from "@/services/statisticsService";

export function StandingsPage() {
  const [tab, setTab] = useState("groups");
  const standings = useServiceQuery(() => getStandings(), []);
  const scorers = useServiceQuery(() => getTopScorers(), []);

  return (
    <PageContainer>
      <PageHeader
        eyebrow="Table"
        title="Standings"
        description="Group points ignore knockout matches. Top scorers count normal goals from every completed stage, and never own goals or penalties."
      />
      <Tabs
        value={tab}
        onChange={setTab}
        tabs={[
          { value: "groups", label: "Groups" },
          { value: "scorers", label: "Top scorers" },
        ]}
      />
      <div className="mt-5">
        {tab === "groups" ? (
          standings.loading ? <Skeleton className="h-64" /> : standings.error ? <ErrorState message={standings.error} onRetry={standings.reload} /> : (
            <div className="grid gap-4">
              {standings.data?.data.map((group) => (
                <GlassCard key={group.groupName} className="p-4">
                  <div className="mb-2 flex items-center justify-between">
                    <h2 className="font-display text-3xl text-fg">{group.groupName}</h2>
                    <p className="text-xs text-muted">Highlighted sides are in the top two</p>
                  </div>
                  <StandingsTable group={group} />
                </GlassCard>
              ))}
            </div>
          )
        ) : scorers.loading ? <Skeleton className="h-64" /> : scorers.error ? <ErrorState message={scorers.error} onRetry={scorers.reload} /> : (
          <div className="grid gap-3">
            {scorers.data?.data.map((scorer) => <TopScorerCard key={scorer.player._id} scorer={scorer} />)}
          </div>
        )}
      </div>
    </PageContainer>
  );
}
