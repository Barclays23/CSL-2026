import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";
import { TeamForm } from "@/components/forms/TeamForm";
import { PlayerCard } from "@/components/players/PlayerCard";
import { TeamStats } from "@/components/teams/TeamStats";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Drawer } from "@/components/ui/Drawer";
import { ErrorState } from "@/components/ui/ErrorState";
import { GlassCard } from "@/components/ui/GlassCard";
import { Skeleton } from "@/components/ui/Skeleton";
import { StatCard } from "@/components/ui/StatCard";
import { useAuth } from "@/contexts/AuthContext";
import { useConfirm } from "@/contexts/ConfirmContext";
import { useServiceQuery } from "@/hooks/useServiceQuery";
import type { TeamFormValues } from "@/schemas/team.schema";
import { createTeam, deleteTeam, getAuctionSummary, updateTeam } from "@/services/teamService";
import type { Asset } from "@/types/api.types";
import type { Team } from "@/types/team.types";
import { errorMessage } from "@/utils/errorHandler";
import { formatCurrency } from "@/utils/formatCurrency";

export function TeamsPage() {
  const { isAuthenticated } = useAuth();
  const confirm = useConfirm();
  const summary = useServiceQuery(() => getAuctionSummary(), []);
  const [editing, setEditing] = useState<Team | null | undefined>(undefined);
  const [saving, setSaving] = useState(false);
  const totals = summary.data?.data.totals;

  const save = async (values: TeamFormValues, logo: Asset | null, poster: Asset | null) => {
    setSaving(true);
    try {
      const payload = { ...values, logo, poster };
      if (editing) await updateTeam(editing._id, payload);
      else await createTeam(payload);
      toast.success(editing ? "Team updated" : "Team created");
      setEditing(undefined);
      summary.reload();
    } catch (error) {
      toast.error(errorMessage(error));
      throw error;
    } finally {
      setSaving(false);
    }
  };

  return (
    <PageContainer>
      <PageHeader
        eyebrow="Auction board"
        title="Teams"
        description="Squads, spend and what is left of each ₹10,000 budget."
        actions={isAuthenticated ? <Button onClick={() => setEditing(null)}>Add team</Button> : null}
      />
      {summary.loading ? <Skeleton className="h-28" /> : null}
      {summary.error ? <ErrorState message={summary.error} onRetry={summary.reload} /> : null}
      {totals ? (
        <div className="mb-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <StatCard label="Active players" value={totals.activeAuctionPlayers} />
          <StatCard label="Pending" value={totals.pendingPlayers} />
          <StatCard label="Sold" value={totals.soldPlayers} />
          <StatCard label="Unsold" value={totals.unsoldPlayers} />
          <StatCard label="Total spend" value={formatCurrency(totals.totalAuctionSpend)} />
          <StatCard label="Active teams" value={totals.activeTeams} />
        </div>
      ) : null}
      <div className="flex flex-col gap-6">
        {summary.data?.data.teams.map((card) => (
          <GlassCard key={card.team._id} className="overflow-hidden">
            {card.team.poster ? <img src={card.team.poster.url} alt="" className="h-36 w-full object-cover" /> : null}
            <div className="p-4 sm:p-5">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                {card.team.logo ? <img src={card.team.logo.url} alt="" className="h-16 w-16 rounded-2xl object-cover" /> : null}
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="font-display text-4xl text-fg">{card.team.name}</h2>
                    {card.team.shortName ? <Badge>{card.team.shortName}</Badge> : null}
                    {card.team.groupName ? <Badge tone="accent">{card.team.groupName}</Badge> : null}
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Link to="/teams/$teamId" params={{ teamId: card.team._id }}>
                    <Button variant="surface" size="sm">View team</Button>
                  </Link>
                  {isAuthenticated ? (
                    <>
                      <Button size="sm" variant="surface" onClick={() => setEditing(card.team)}>Edit</Button>
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={async () => {
                          const yes = await confirm({
                            title: `Delete ${card.team.name}?`,
                            description: "The team can only be deleted after its players, managers and fixtures are cleared.",
                            confirmLabel: "Delete team",
                            danger: true,
                          });
                          if (!yes) return;
                          try {
                            await deleteTeam(card.team._id);
                            toast.success("Team deleted");
                            summary.reload();
                          } catch (error) {
                            toast.error(errorMessage(error));
                          }
                        }}
                      >
                        Delete
                      </Button>
                    </>
                  ) : null}
                </div>
              </div>
              <div className="mt-4">
                <TeamStats stats={card.stats} />
              </div>
              <div className="mt-4 grid grid-cols-1 gap-3 min-[420px]:grid-cols-2 lg:grid-cols-3">
                {card.players.map((player) => (
                  <PlayerCard key={player._id} player={player} />
                ))}
              </div>
            </div>
          </GlassCard>
        ))}
      </div>
      <Drawer open={editing !== undefined} title={editing ? "Edit team" : "Add team"} onClose={() => setEditing(undefined)}>
        <TeamForm team={editing} submitting={saving} onSubmit={save} />
      </Drawer>
    </PageContainer>
  );
}
