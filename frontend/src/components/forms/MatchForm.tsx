import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormField } from "@/components/forms/FormField";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { MATCH_STATUSES, STAGES } from "@/constants/football";
import { matchFormSchema, type MatchFormValues } from "@/schemas/match.schema";
import type { Match } from "@/types/match.types";
import type { Team } from "@/types/team.types";
import { toDateTimeInput } from "@/utils/formatDate";
import { applyFieldErrors } from "@/utils/forms";
import { refId } from "@/utils/refs";



export function MatchForm({
  match,
  teams,
  submitting,
  onSubmit,
}: {
  match?: Match | null;
  teams: Team[];
  submitting: boolean;
  onSubmit: (values: MatchFormValues) => Promise<void>;
}) {
  const form = useForm<MatchFormValues>({
    resolver: zodResolver(matchFormSchema) as Resolver<MatchFormValues>,
    defaultValues: {
      matchNo: match?.matchNo ?? "",
      stage: match?.stage ?? "group",
      groupName: match?.groupName ?? "",
      kickoffAt: match ? toDateTimeInput(match.kickoffAt) : "",
      venue: match?.venue ?? "",
      team1Ref: match ? refId(match.team1Ref) ?? "" : "",
      team2Ref: match ? refId(match.team2Ref) ?? "" : "",
      status: match?.status ?? "scheduled",
      team1Shootout: match?.penaltyShootout?.team1Score ?? "",
      team2Shootout: match?.penaltyShootout?.team2Score ?? "",
      notes: match?.notes ?? "",
    },
  });

  return (
    <form
      className="grid gap-4"
      onSubmit={form.handleSubmit(async (values) => {
        try {
          await onSubmit(values);
        } catch (error) {
          applyFieldErrors(error, form.setError);
          throw error;
        }
      })}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="Match number" required error={form.formState.errors.matchNo?.message}>
          <Input {...form.register("matchNo")} placeholder="M12" />
        </FormField>
        <FormField label="Stage" error={form.formState.errors.stage?.message}>
          <Select {...form.register("stage")}>
            {STAGES.map((stage) => (
              <option key={stage.value} value={stage.value}>
                {stage.label}
              </option>
            ))}
          </Select>
        </FormField>
      </div>
      <FormField label="Group" hint="Required for group fixtures. Leave blank for knockout matches." error={form.formState.errors.groupName?.message}>
        <Input {...form.register("groupName")} placeholder="Group A" />
      </FormField>
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="Kick-off" required error={form.formState.errors.kickoffAt?.message}>
          <Input type="datetime-local" {...form.register("kickoffAt")} />
        </FormField>
        <FormField label="Venue" error={form.formState.errors.venue?.message}>
          <Input {...form.register("venue")} />
        </FormField>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="Home team" required error={form.formState.errors.team1Ref?.message}>
          <Select {...form.register("team1Ref")}>
            <option value="">Choose</option>
            {teams.filter((team) => team.status === "active").map((team) => (
              <option key={team._id} value={team._id}>
                {team.name}
              </option>
            ))}
          </Select>
        </FormField>
        <FormField label="Away team" required error={form.formState.errors.team2Ref?.message}>
          <Select {...form.register("team2Ref")}>
            <option value="">Choose</option>
            {teams.filter((team) => team.status === "active").map((team) => (
              <option key={team._id} value={team._id}>
                {team.name}
              </option>
            ))}
          </Select>
        </FormField>
      </div>
      <FormField label="Status" error={form.formState.errors.status?.message}>
        <Select {...form.register("status")}>
          {MATCH_STATUSES.map((status) => (
            <option key={status.value} value={status.value}>
              {status.label}
            </option>
          ))}
        </Select>
      </FormField>
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="Home shootout" hint="Knockout only, and only when normal time is level." error={form.formState.errors.team1Shootout?.message}>
          <Input type="number" min={0} {...form.register("team1Shootout")} />
        </FormField>
        <FormField label="Away shootout" error={form.formState.errors.team2Shootout?.message}>
          <Input type="number" min={0} {...form.register("team2Shootout")} />
        </FormField>
      </div>
      <FormField label="Notes" error={form.formState.errors.notes?.message}>
        <Textarea {...form.register("notes")} />
      </FormField>
      <p className="text-xs text-muted">The match score is calculated from goals. Add goals after saving the fixture.</p>
      <Button type="submit" disabled={submitting}>
        {submitting ? "Saving…" : "Save fixture"}
      </Button>
    </form>
  );
}
