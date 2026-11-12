import { useEffect, useState } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { FormField } from "@/components/forms/FormField";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/Button";
import { ErrorState } from "@/components/ui/ErrorState";
import { GlassCard } from "@/components/ui/GlassCard";
import { Input } from "@/components/ui/Input";
import { Skeleton } from "@/components/ui/Skeleton";
import { USE_MOCK_API } from "@/config/env";
import { useConfirm } from "@/contexts/ConfirmContext";
import { useServiceQuery } from "@/hooks/useServiceQuery";
import { AdminRoute } from "@/components/auth/AdminRoute";
import { settingsFormSchema, type SettingsFormValues } from "@/schemas/settings.schema";
import { getSettings, resetPreviewData, updateSettings } from "@/services/settingsService";
import { applyFieldErrors } from "@/utils/forms";
import { errorMessage } from "@/utils/errorHandler";
import { toDateInput } from "@/utils/formatDate";

export function SettingsPage() {
  return (
    <AdminRoute>
      <SettingsBody />
    </AdminRoute>
  );
}

function SettingsBody() {
  const confirm = useConfirm();
  const settings = useServiceQuery(() => getSettings(), []);
  const [saving, setSaving] = useState(false);
  const form = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsFormSchema) as Resolver<SettingsFormValues>,
    defaultValues: {
      tournamentName: "",
      startDate: "",
      endDate: "",
      maxActivePlayers: 54,
      maxActiveTeams: 6,
      maxPlayersPerTeam: 9,
      auctionBudgetPerTeam: 10000,
      requiredIconPlayers: 1,
      requiredGoalkeepers: 1,
      win: 3,
      draw: 1,
      loss: 0,
    },
  });

  useEffect(() => {
    const record = settings.data?.data;
    if (!record) return;
    form.reset({
      tournamentName: record.tournamentName,
      startDate: toDateInput(record.startDate) || record.startDate.slice(0, 10),
      endDate: toDateInput(record.endDate) || record.endDate.slice(0, 10),
      maxActivePlayers: record.maxActivePlayers,
      maxActiveTeams: record.maxActiveTeams,
      maxPlayersPerTeam: record.maxPlayersPerTeam,
      auctionBudgetPerTeam: record.auctionBudgetPerTeam,
      requiredIconPlayers: record.requiredIconPlayers,
      requiredGoalkeepers: record.requiredGoalkeepers,
      win: record.pointsRule.win,
      draw: record.pointsRule.draw,
      loss: record.pointsRule.loss,
    });
  }, [settings.data, form]);

  if (settings.loading) return <PageContainer><Skeleton className="h-80" /></PageContainer>;
  if (settings.error || !settings.data) {
    return <PageContainer><ErrorState message={settings.error || "Settings unavailable"} onRetry={settings.reload} /></PageContainer>;
  }

  return (
    <PageContainer>
      <PageHeader
        eyebrow="One document"
        title="Tournament settings"
        description="There is a single settings record for the current tournament. Nothing here is added or deleted."
      />
      <GlassCard className="p-5">
        <form
          className="grid gap-4"
          onSubmit={form.handleSubmit(async (values) => {
            setSaving(true);
            try {
              await updateSettings({
                tournamentName: values.tournamentName,
                startDate: values.startDate,
                endDate: values.endDate,
                maxActivePlayers: values.maxActivePlayers,
                maxActiveTeams: values.maxActiveTeams,
                maxPlayersPerTeam: values.maxPlayersPerTeam,
                auctionBudgetPerTeam: values.auctionBudgetPerTeam,
                requiredIconPlayers: values.requiredIconPlayers,
                requiredGoalkeepers: values.requiredGoalkeepers,
                pointsRule: { win: values.win, draw: values.draw, loss: values.loss },
              });
              toast.success("Settings saved");
              settings.reload();
            } catch (error) {
              applyFieldErrors(error, form.setError);
              toast.error(errorMessage(error));
            } finally {
              setSaving(false);
            }
          })}
        >
          <FormField label="Tournament name" required error={form.formState.errors.tournamentName?.message}>
            <Input {...form.register("tournamentName")} />
          </FormField>
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField label="Start date" required error={form.formState.errors.startDate?.message}>
              <Input type="date" {...form.register("startDate")} />
            </FormField>
            <FormField label="End date" required error={form.formState.errors.endDate?.message}>
              <Input type="date" {...form.register("endDate")} />
            </FormField>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <FormField label="Max active players" hint="Default 54" error={form.formState.errors.maxActivePlayers?.message}>
              <Input type="number" {...form.register("maxActivePlayers")} />
            </FormField>
            <FormField label="Max active teams" hint="Default 6" error={form.formState.errors.maxActiveTeams?.message}>
              <Input type="number" {...form.register("maxActiveTeams")} />
            </FormField>
            <FormField label="Players per team" hint="Default 9" error={form.formState.errors.maxPlayersPerTeam?.message}>
              <Input type="number" {...form.register("maxPlayersPerTeam")} />
            </FormField>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <FormField label="Budget per team (INR)" error={form.formState.errors.auctionBudgetPerTeam?.message}>
              <Input type="number" {...form.register("auctionBudgetPerTeam")} />
            </FormField>
            <FormField label="Icon players required" error={form.formState.errors.requiredIconPlayers?.message}>
              <Input type="number" {...form.register("requiredIconPlayers")} />
            </FormField>
            <FormField label="Goalkeepers required" hint="One player may be both icon and goalkeeper." error={form.formState.errors.requiredGoalkeepers?.message}>
              <Input type="number" {...form.register("requiredGoalkeepers")} />
            </FormField>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <FormField label="Points for a win" error={form.formState.errors.win?.message}>
              <Input type="number" {...form.register("win")} />
            </FormField>
            <FormField label="Points for a draw" error={form.formState.errors.draw?.message}>
              <Input type="number" {...form.register("draw")} />
            </FormField>
            <FormField label="Points for a loss" error={form.formState.errors.loss?.message}>
              <Input type="number" {...form.register("loss")} />
            </FormField>
          </div>
          <Button type="submit" disabled={saving}>{saving ? "Saving…" : "Save settings"}</Button>
        </form>
      </GlassCard>
      {USE_MOCK_API ? (
        <GlassCard className="mt-4 p-5">
          <h2 className="font-display text-2xl text-fg">Preview data</h2>
          <p className="mt-2 text-sm text-muted">Restore the sample tournament. This only exists before the real API is connected.</p>
          <Button
            className="mt-4"
            variant="surface"
            onClick={async () => {
              const yes = await confirm({
                title: "Reset sample data?",
                description: "Your preview edits will be replaced by the original sample tournament.",
                confirmLabel: "Reset",
                danger: true,
              });
              if (!yes) return;
              await resetPreviewData();
              toast.success("Sample tournament restored");
              settings.reload();
            }}
          >
            Reset sample data
          </Button>
        </GlassCard>
      ) : null}
    </PageContainer>
  );
}
