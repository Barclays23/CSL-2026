import { useState } from "react";
import { toast } from "sonner";
import { MatchForm } from "@/components/forms/MatchForm";
import { SearchBar } from "@/components/forms/SearchBar";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";
import { FixtureCard } from "@/components/matches/FixtureCard";
import { Button } from "@/components/ui/Button";
import { Drawer } from "@/components/ui/Drawer";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { Pagination } from "@/components/ui/Pagination";
import { Select } from "@/components/ui/Select";
import { Skeleton } from "@/components/ui/Skeleton";
import { Tabs } from "@/components/ui/Tabs";
import { STAGES } from "@/constants/football";
import { useAuth } from "@/contexts/AuthContext";
import { useDebounce } from "@/hooks/useDebounce";
import { useServiceQuery } from "@/hooks/useServiceQuery";
import type { MatchFormValues } from "@/schemas/match.schema";
import { createMatch, getMatches } from "@/services/matchService";
import { getTeams } from "@/services/teamService";
import type { MatchStage, MatchStatus } from "@/types/match.types";
import { fromDateTimeInput } from "@/utils/formatDate";
import { errorMessage } from "@/utils/errorHandler";

const TABS: { value: MatchStatus | ""; label: string }[] = [
  { value: "", label: "All" },
  { value: "scheduled", label: "Upcoming" },
  { value: "live", label: "Live" },
  { value: "completed", label: "Results" },
  { value: "postponed", label: "Postponed" },
  { value: "cancelled", label: "Cancelled" },
];

export function MatchesPage() {
  const { isAuthenticated } = useAuth();
  const [status, setStatus] = useState<MatchStatus | "">("");
  const [stage, setStage] = useState<MatchStage | "">("");
  const [groupName, setGroupName] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const debounced = useDebounce(search);
  const teams = useServiceQuery(() => getTeams(), []);
  const matches = useServiceQuery(
    () => getMatches({ page, limit: 8, status, stage, groupName, search: debounced }),
    [page, status, stage, groupName, debounced],
  );

  return (
    <PageContainer>
      <PageHeader
        eyebrow="Calendar"
        title="Fixtures"
        description="Kick-off times, scores and penalty shootouts. Shootout kicks never change the match score."
        actions={isAuthenticated ? <Button onClick={() => setOpen(true)}>Create fixture</Button> : null}
      />
      <Tabs tabs={TABS} value={status} onChange={(value) => { setStatus(value as MatchStatus | ""); setPage(1); }} />
      <div className="my-4 grid gap-3 md:grid-cols-3">
        <SearchBar value={search} onChange={(value) => { setSearch(value); setPage(1); }} placeholder="Search match number or team" />
        <Select value={stage} aria-label="Stage" onChange={(event) => { setStage(event.target.value as MatchStage | ""); setPage(1); }}>
          <option value="">All stages</option>
          {STAGES.map((item) => (
            <option key={item.value} value={item.value}>{item.label}</option>
          ))}
        </Select>
        <Select value={groupName} aria-label="Group" onChange={(event) => { setGroupName(event.target.value); setPage(1); }}>
          <option value="">All groups</option>
          <option value="Group A">Group A</option>
          <option value="Group B">Group B</option>
        </Select>
      </div>
      {matches.loading ? <Skeleton className="h-40" /> : null}
      {matches.error ? <ErrorState message={matches.error} onRetry={matches.reload} /> : null}
      {matches.data?.data.length === 0 ? <EmptyState title="No fixtures" description="Nothing matches these filters." /> : null}
      <div className="grid gap-3 lg:grid-cols-2">
        {matches.data?.data.map((match) => <FixtureCard key={match._id} match={match} />)}
      </div>
      <Pagination pagination={matches.data?.pagination} onPage={setPage} />
      <Drawer open={open} title="Create fixture" onClose={() => setOpen(false)}>
        <MatchForm
          teams={teams.data?.data ?? []}
          submitting={saving}
          onSubmit={async (values: MatchFormValues) => {
            setSaving(true);
            try {
              await createMatch({
                matchNo: values.matchNo,
                stage: values.stage,
                groupName: values.groupName,
                kickoffAt: fromDateTimeInput(values.kickoffAt),
                venue: values.venue,
                team1Ref: values.team1Ref,
                team2Ref: values.team2Ref,
                status: values.status,
                notes: values.notes,
                penaltyShootout:
                  values.team1Shootout !== null && values.team2Shootout !== null
                    ? { team1Score: values.team1Shootout, team2Score: values.team2Shootout }
                    : null,
              });
              toast.success("Fixture created");
              setOpen(false);
              matches.reload();
            } catch (error) {
              toast.error(errorMessage(error));
              throw error;
            } finally {
              setSaving(false);
            }
          }}
        />
      </Drawer>
    </PageContainer>
  );
}
