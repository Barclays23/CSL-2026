import { useState } from "react";
import { toast } from "sonner";
import { ManagerForm } from "@/components/forms/ManagerForm";
import { SearchBar } from "@/components/forms/SearchBar";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";
import { ManagerCard } from "@/components/managers/ManagerCard";
import { Button } from "@/components/ui/Button";
import { Drawer } from "@/components/ui/Drawer";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { Pagination } from "@/components/ui/Pagination";
import { CardSkeletonGrid } from "@/components/ui/Skeleton";
import { useAuth } from "@/contexts/AuthContext";
import { useConfirm } from "@/contexts/ConfirmContext";
import { useDebounce } from "@/hooks/useDebounce";
import { useServiceQuery } from "@/hooks/useServiceQuery";
import type { ManagerFormValues } from "@/schemas/manager.schema";
import { createManager, deleteManager, getManagers, updateManager } from "@/services/managerService";
import { getTeams } from "@/services/teamService";
import type { Asset } from "@/types/api.types";
import type { PublicManager } from "@/types/manager.types";
import { errorMessage } from "@/utils/errorHandler";

export function ManagersPage() {
  const { isAuthenticated } = useAuth();
  const confirm = useConfirm();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [editing, setEditing] = useState<PublicManager | null | undefined>(undefined);
  const [saving, setSaving] = useState(false);
  const debounced = useDebounce(search);
  const teams = useServiceQuery(() => getTeams(), []);
  const managers = useServiceQuery(() => getManagers({ page, limit: 12, search: debounced }), [page, debounced]);

  const save = async (values: ManagerFormValues, photo: Asset | null) => {
    setSaving(true);
    try {
      const payload = { ...values, profilePic: photo };
      if (editing) await updateManager(editing._id, payload);
      else await createManager(payload);
      toast.success(editing ? "Manager updated" : "Manager created");
      setEditing(undefined);
      managers.reload();
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
        eyebrow="Bench"
        title="Managers"
        description="Who is in charge of each side. Phone numbers are not shown publicly."
        actions={isAuthenticated ? <Button onClick={() => setEditing(null)}>Add manager</Button> : null}
      />
      <div className="mb-5 max-w-md">
        <SearchBar value={search} onChange={(value) => { setSearch(value); setPage(1); }} placeholder="Search managers" />
      </div>
      {managers.loading ? <CardSkeletonGrid /> : null}
      {managers.error ? <ErrorState message={managers.error} onRetry={managers.reload} /> : null}
      {managers.data?.data.length === 0 ? <EmptyState title="No managers" description="No managers match this search." /> : null}
      <div className="grid gap-3 md:grid-cols-2">
        {managers.data?.data.map((manager) => (
          <div key={manager._id} className="grid gap-2">
            <ManagerCard manager={manager} />
            {isAuthenticated ? (
              <div className="flex gap-2">
                <Button size="sm" variant="surface" onClick={() => setEditing(manager)}>Edit</Button>
                <Button
                  size="sm"
                  variant="danger"
                  onClick={async () => {
                    const yes = await confirm({
                      title: `Delete ${manager.name}?`,
                      description: "This removes the manager from the current tournament.",
                      confirmLabel: "Delete manager",
                      danger: true,
                    });
                    if (!yes) return;
                    try {
                      await deleteManager(manager._id);
                      toast.success("Manager deleted");
                      managers.reload();
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
        ))}
      </div>
      <Pagination pagination={managers.data?.pagination} onPage={setPage} />
      <Drawer open={editing !== undefined} title={editing ? "Edit manager" : "Add manager"} onClose={() => setEditing(undefined)}>
        <ManagerForm manager={editing} teams={teams.data?.data ?? []} submitting={saving} onSubmit={save} />
      </Drawer>
    </PageContainer>
  );
}
