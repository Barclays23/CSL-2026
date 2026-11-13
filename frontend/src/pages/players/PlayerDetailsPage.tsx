import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { PageContainer } from "@/components/layout/PageContainer";
import { PlayerForm } from "@/components/forms/PlayerForm";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Drawer } from "@/components/ui/Drawer";
import { ErrorState } from "@/components/ui/ErrorState";
import { GlassCard } from "@/components/ui/GlassCard";
import { Skeleton } from "@/components/ui/Skeleton";
import { POSITION_LABEL } from "@/constants/football.constants";
import { useAuth } from "@/contexts/AuthContext";
import { useConfirm } from "@/contexts/ConfirmContext";
import { useServiceQuery } from "@/hooks/useServiceQuery";
import type { PlayerFormValues } from "@/schemas/player.schema";
import { deactivatePlayer, deletePlayer, getPlayerById, updatePlayer } from "@/services/playerService";
import { getTeams } from "@/services/teamService";
import type { Asset } from "@/types/api.types";
import { errorMessage } from "@/utils/errorHandler";
import { formatCurrency } from "@/utils/formatCurrency";
import { isAdminRecord } from "@/utils/forms";

export function PlayerDetailsPage({ playerId }: { playerId: string }) {
  const { isAuthenticated } = useAuth();
  const confirm = useConfirm();
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const player = useServiceQuery(() => getPlayerById(playerId), [playerId]);
  const teams = useServiceQuery(() => getTeams(), []);
  const record = player.data?.data;
  const admin = record && isAdminRecord(record) ? record : null;

  const save = async (values: PlayerFormValues, photo: Asset | null) => {
    setSaving(true);
    try {
      await updatePlayer(playerId, { ...values, profilePic: photo });
      toast.success("Player updated");
      setOpen(false);
      player.reload();
    } catch (error) {
      toast.error(errorMessage(error));
      throw error;
    } finally {
      setSaving(false);
    }
  };

  if (player.loading) {
    return (
      <PageContainer>
        <Skeleton className="h-64" />
      </PageContainer>
    );
  }
  if (player.error || !record) {
    return (
      <PageContainer>
        <ErrorState message={player.error || "Player not found"} onRetry={player.reload} />
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <Link to="/players" className="text-sm font-semibold text-accent">
        Back to players
      </Link>
      <GlassCard className="mt-4 grid gap-6 p-5 sm:grid-cols-[auto_1fr]">
        <Avatar name={record.name} asset={record.profilePic} className="h-28 w-28" />
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="font-display text-5xl text-fg">{record.name}</h1>
            <Badge tone="primary">{record.position}</Badge>
            {record.isIconPlayer ? <Badge tone="gold">Icon</Badge> : null}
          </div>
          <p className="mt-2 text-muted">{POSITION_LABEL[record.position]}</p>
          <dl className="mt-4 grid gap-3 sm:grid-cols-2">
            <div>
              <dt className="text-xs text-muted">Team</dt>
              <dd className="text-fg">{record.team?.name ?? "Unassigned"}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted">Jersey</dt>
              <dd className="text-fg">{record.jerseyNo ? `#${record.jerseyNo}` : "Not assigned"}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted">Auction</dt>
              <dd className="text-fg">
                {record.auctionStatus} · {formatCurrency(record.auctionPrice)}
              </dd>
            </div>
            {admin ? (
              <>
                <div>
                  <dt className="text-xs text-muted">Mobile</dt>
                  <dd className="text-fg">{admin.mobile}</dd>
                </div>
                <div>
                  <dt className="text-xs text-muted">Email</dt>
                  <dd className="text-fg">{admin.email || "—"}</dd>
                </div>
              </>
            ) : null}
          </dl>
          {isAuthenticated ? (
            <div className="mt-5 flex flex-wrap gap-2">
              <Button onClick={() => setOpen(true)}>Edit</Button>
              <Button
                variant="surface"
                onClick={async () => {
                  await deactivatePlayer(playerId);
                  toast.success("Player deactivated and unassigned");
                  player.reload();
                }}
              >
                Deactivate
              </Button>
              <Button
                variant="danger"
                onClick={async () => {
                  const yes = await confirm({
                    title: `Delete ${record.name}?`,
                    description: "Goals that still name this player will block deletion.",
                    confirmLabel: "Delete",
                    danger: true,
                  });
                  if (!yes) return;
                  try {
                    await deletePlayer(playerId);
                    toast.success("Player deleted");
                    window.history.back();
                  } catch (error) {
                    toast.error(errorMessage(error));
                  }
                }}
              >
                Delete
              </Button>
            </div>
          ) : null}
        </div>
      </GlassCard>
      <Drawer open={open} title="Edit player" onClose={() => setOpen(false)}>
        <PlayerForm player={record} teams={teams.data?.data ?? []} submitting={saving} onSubmit={save} />
      </Drawer>
    </PageContainer>
  );
}
