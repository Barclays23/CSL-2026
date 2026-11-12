import { useState } from "react";
import { toast } from "sonner";
import { SponsorForm } from "@/components/forms/SponsorForm";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";
import { SponsorCard } from "@/components/sponsors/SponsorCard";
import { Button } from "@/components/ui/Button";
import { Drawer } from "@/components/ui/Drawer";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { CardSkeletonGrid } from "@/components/ui/Skeleton";
import { useAuth } from "@/contexts/AuthContext";
import { useConfirm } from "@/contexts/ConfirmContext";
import { useServiceQuery } from "@/hooks/useServiceQuery";
import type { SponsorFormValues } from "@/schemas/sponsor.schema";
import { createSponsor, deleteSponsor, getSponsors, updateSponsor } from "@/services/sponsorService";
import type { Asset } from "@/types/api.types";
import type { PublicSponsor } from "@/types/sponsor.types";
import { errorMessage } from "@/utils/errorHandler";
import { isAdminRecord } from "@/utils/forms";

export function SponsorsPage() {
  const { isAuthenticated } = useAuth();
  const confirm = useConfirm();
  const sponsors = useServiceQuery(() => getSponsors({ limit: 24 }), []);
  const [editing, setEditing] = useState<PublicSponsor | null | undefined>(undefined);
  const [saving, setSaving] = useState(false);
  const visible = sponsors.data?.data.filter((sponsor) => isAuthenticated || sponsor.status === "active") ?? [];

  const save = async (values: SponsorFormValues, logo: Asset | null) => {
    setSaving(true);
    try {
      const payload = { ...values, logo };
      if (editing) await updateSponsor(editing._id, payload);
      else await createSponsor(payload);
      toast.success(editing ? "Sponsor updated" : "Sponsor created");
      setEditing(undefined);
      sponsors.reload();
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
        eyebrow="Support"
        title="Sponsors"
        description="The people and businesses backing this tournament."
        actions={isAuthenticated ? <Button onClick={() => setEditing(null)}>Add sponsor</Button> : null}
      />
      {sponsors.loading ? <CardSkeletonGrid /> : null}
      {sponsors.error ? <ErrorState message={sponsors.error} onRetry={sponsors.reload} /> : null}
      {sponsors.data && visible.length === 0 ? <EmptyState title="No sponsors yet" description="Active sponsors will appear here." /> : null}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {visible.map((sponsor) => (
          <div key={sponsor._id} className="grid gap-2">
            <SponsorCard sponsor={sponsor} />
            {isAuthenticated && isAdminRecord(sponsor) ? (
              <p className="px-1 text-xs text-muted">{sponsor.notes || "No internal notes"}</p>
            ) : null}
            {isAuthenticated ? (
              <div className="flex gap-2">
                <Button size="sm" variant="surface" onClick={() => setEditing(sponsor)}>Edit</Button>
                <Button
                  size="sm"
                  variant="danger"
                  onClick={async () => {
                    const yes = await confirm({
                      title: `Delete ${sponsor.name}?`,
                      description: "The sponsor will disappear from the public page.",
                      confirmLabel: "Delete sponsor",
                      danger: true,
                    });
                    if (!yes) return;
                    try {
                      await deleteSponsor(sponsor._id);
                      toast.success("Sponsor deleted");
                      sponsors.reload();
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
      <Drawer open={editing !== undefined} title={editing ? "Edit sponsor" : "Add sponsor"} onClose={() => setEditing(undefined)}>
        <SponsorForm sponsor={editing} submitting={saving} onSubmit={save} />
      </Drawer>
    </PageContainer>
  );
}
