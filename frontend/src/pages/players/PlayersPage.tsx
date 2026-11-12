import { useState } from "react";
import { toast } from "sonner";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";
import { PlayerForm } from "@/components/forms/PlayerForm";
import { SearchBar } from "@/components/forms/SearchBar";
import { PlayerCard } from "@/components/players/PlayerCard";
import { Button } from "@/components/ui/Button";
import { Drawer } from "@/components/ui/Drawer";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { Pagination } from "@/components/ui/Pagination";
import { Select } from "@/components/ui/Select";
import { CardSkeletonGrid } from "@/components/ui/Skeleton";
import { AUCTION_STATUSES, PLAYER_STATUSES, POSITIONS } from "@/constants/football";
import { useAuth } from "@/contexts/AuthContext";
import { useConfirm } from "@/contexts/ConfirmContext";
import { useDebounce } from "@/hooks/useDebounce";
import { useServiceQuery } from "@/hooks/useServiceQuery";
import type { PlayerFormValues } from "@/schemas/player.schema";
import { createPlayer, deletePlayer, getPlayers, updatePlayer } from "@/services/playerService";
import { getTeams } from "@/services/teamService";
import type { Asset } from "@/types/api.types";
import type { AuctionStatus, PlayerStatus, Position, PublicPlayer } from "@/types/player.types";
import { errorMessage } from "@/utils/errorHandler";

export function PlayersPage() {
  const { isAuthenticated } = useAuth();
  const confirm = useConfirm();
  const [search, setSearch] = useState("");
  const [position, setPosition] = useState<Position | "">("");
  const [teamRef, setTeamRef] = useState("");
  const [status, setStatus] = useState<PlayerStatus | "">("");
  const [auctionStatus, setAuctionStatus] = useState<AuctionStatus | "">("");
  const [page, setPage] = useState(1);
  const [editing, setEditing] = useState<PublicPlayer | null | undefined>(undefined);
  const [saving, setSaving] = useState(false);
  const debounced = useDebounce(search);
  const teams = useServiceQuery(() => getTeams(), []);
  const players = useServiceQuery(
    () =>
      getPlayers({
        page,
        limit: 12,
        search: debounced,
        position,
        teamRef,
        status: isAuthenticated ? status : "",
        auctionStatus: isAuthenticated ? auctionStatus : "",
      }),
    [page, debounced, position, teamRef, status, auctionStatus, isAuthenticated],
  );

  const save = async (values: PlayerFormValues, photo: Asset | null) => {
    setSaving(true);
    try {
      const payload = { ...values, profilePic: photo };
      if (editing) await updatePlayer(editing._id, payload);
      else await createPlayer(payload);
      toast.success(editing ? "Player updated" : "Player created");
      setEditing(undefined);
      players.reload();
    } catch (error) {
      toast.error(errorMessage(error));
      throw error;
    } finally {
      setSaving(false);
    }
  };

  const remove = async (player: PublicPlayer) => {
    const yes = await confirm({
      title: `Delete ${player.name}?`,
      description: "This removes the player. If a match still names them, the server will refuse and you should deactivate instead.",
      confirmLabel: "Delete player",
      danger: true,
    });
    if (!yes) return;
    try {
      await deletePlayer(player._id);
      toast.success("Player deleted");
      players.reload();
    } catch (error) {
      toast.error(errorMessage(error));
    }
  };

  return (
    <PageContainer>
      <PageHeader
        eyebrow="Squad list"
        title="Players"
        description="Every player in the current tournament. Contact details stay with the admin."
        actions={
          isAuthenticated ? (
            <Button onClick={() => setEditing(null)}>Add player</Button>
          ) : null
        }
      />
      <div className="mb-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <SearchBar value={search} onChange={(value) => { setSearch(value); setPage(1); }} placeholder="Search players" />
        <Select value={position} onChange={(event) => { setPosition(event.target.value as Position | ""); setPage(1); }} aria-label="Position">
          <option value="">All positions</option>
          {POSITIONS.map((item) => (
            <option key={item.value} value={item.value}>{item.label}</option>
          ))}
        </Select>
        <Select value={teamRef} onChange={(event) => { setTeamRef(event.target.value); setPage(1); }} aria-label="Team">
          <option value="">All teams</option>
          <option value="unassigned">Unassigned</option>
          {teams.data?.data.map((team) => (
            <option key={team._id} value={team._id}>{team.name}</option>
          ))}
        </Select>
        {isAuthenticated ? (
          <>
            <Select value={status} onChange={(event) => { setStatus(event.target.value as PlayerStatus | ""); setPage(1); }} aria-label="Status">
              <option value="">Any status</option>
              {PLAYER_STATUSES.map((item) => (
                <option key={item.value} value={item.value}>{item.label}</option>
              ))}
            </Select>
            <Select value={auctionStatus} onChange={(event) => { setAuctionStatus(event.target.value as AuctionStatus | ""); setPage(1); }} aria-label="Auction status">
              <option value="">Any auction status</option>
              {AUCTION_STATUSES.map((item) => (
                <option key={item.value} value={item.value}>{item.label}</option>
              ))}
            </Select>
          </>
        ) : null}
        <Button variant="ghost" onClick={() => { setSearch(""); setPosition(""); setTeamRef(""); setStatus(""); setAuctionStatus(""); setPage(1); }}>
          Clear filters
        </Button>
      </div>
      {players.loading ? <CardSkeletonGrid /> : null}
      {players.error ? <ErrorState message={players.error} onRetry={players.reload} /> : null}
      {players.data && players.data.data.length === 0 ? (
        <EmptyState title="No players found" description="Try another search, or add a player if you are the admin." />
      ) : null}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {players.data?.data.map((player) => (
          <div key={player._id} className="grid gap-2">
            <PlayerCard player={player} />
            {isAuthenticated ? (
              <div className="flex gap-2">
                <Button size="sm" variant="surface" onClick={() => setEditing(player)}>Edit</Button>
                <Button size="sm" variant="danger" onClick={() => void remove(player)}>Delete</Button>
              </div>
            ) : null}
          </div>
        ))}
      </div>
      <Pagination pagination={players.data?.pagination} onPage={setPage} />
      <Drawer
        open={editing !== undefined}
        title={editing ? "Edit player" : "Add player"}
        onClose={() => setEditing(undefined)}
      >
        <PlayerForm player={editing} teams={teams.data?.data ?? []} submitting={saving} onSubmit={save} />
      </Drawer>
    </PageContainer>
  );
}
