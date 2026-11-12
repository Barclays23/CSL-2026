import { useMemo } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormField } from "@/components/forms/FormField";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { goalFormSchema, type GoalFormValues } from "@/schemas/match.schema";
import type { Goal, Match } from "@/types/match.types";
import type { PublicPlayer } from "@/types/player.types";
import { applyFieldErrors } from "@/utils/forms";
import { refId, isPopulated } from "@/utils/refs";

export function GoalForm({
  match,
  goal,
  players,
  submitting,
  onSubmit,
}: {
  match: Match;
  goal?: Goal | null;
  players: PublicPlayer[];
  submitting: boolean;
  onSubmit: (values: GoalFormValues) => Promise<void>;
}) {
  const team1 = refId(match.team1Ref) ?? "";
  const team2 = refId(match.team2Ref) ?? "";
  const form = useForm<GoalFormValues>({
    resolver: zodResolver(goalFormSchema) as Resolver<GoalFormValues>,
    defaultValues: {
      scoringTeamRef: goal ? refId(goal.scoringTeamRef) ?? team1 : team1,
      goalType: goal?.goalType ?? "normal",
      scorerRef: goal?.scorerRef ? refId(goal.scorerRef) ?? "" : "",
      ownGoalPlayerRef: goal?.ownGoalPlayerRef ? refId(goal.ownGoalPlayerRef) ?? "" : "",
    },
  });
  const scoringTeamRef = useWatch({ control: form.control, name: "scoringTeamRef" });
  const goalType = useWatch({ control: form.control, name: "goalType" });
  const opponent = scoringTeamRef === team1 ? team2 : team1;
  const choices = useMemo(() => {
    const teamId = goalType === "own_goal" ? opponent : scoringTeamRef;
    return players.filter((player) => player.teamRef === teamId && player.status === "active");
  }, [players, goalType, opponent, scoringTeamRef]);
  const teamLabel = (id: string) => {
    if (id === team1 && isPopulated(match.team1Ref)) return match.team1Ref.name;
    if (id === team2 && isPopulated(match.team2Ref)) return match.team2Ref.name;
    return "Team";
  };

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
      <FormField label="Team credited" error={form.formState.errors.scoringTeamRef?.message}>
        <Select {...form.register("scoringTeamRef")}>
          <option value={team1}>{teamLabel(team1)}</option>
          <option value={team2}>{teamLabel(team2)}</option>
        </Select>
      </FormField>
      <FormField label="Goal type" error={form.formState.errors.goalType?.message}>
        <Select {...form.register("goalType")}>
          <option value="normal">Normal goal</option>
          <option value="own_goal">Own goal</option>
        </Select>
      </FormField>
      {goalType === "normal" ? (
        <FormField label="Scorer" hint="Leave blank only if the scorer was not recorded. Own goals are excluded from top scorers." error={form.formState.errors.scorerRef?.message}>
          <Select {...form.register("scorerRef")}>
            <option value="">Not recorded</option>
            {choices.map((player) => (
              <option key={player._id} value={player._id}>
                {player.jerseyNo ? `#${player.jerseyNo} ` : ""}
                {player.name}
              </option>
            ))}
          </Select>
        </FormField>
      ) : (
        <FormField label="Own-goal player" error={form.formState.errors.ownGoalPlayerRef?.message}>
          <Select {...form.register("ownGoalPlayerRef")}>
            <option value="">Choose opposing player</option>
            {choices.map((player) => (
              <option key={player._id} value={player._id}>
                {player.name}
              </option>
            ))}
          </Select>
        </FormField>
      )}
      <Button type="submit" disabled={submitting}>
        {submitting ? "Saving…" : "Save goal"}
      </Button>
    </form>
  );
}
