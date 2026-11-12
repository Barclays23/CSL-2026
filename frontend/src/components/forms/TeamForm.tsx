import { useState } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormField } from "@/components/forms/FormField";
import { Button } from "@/components/ui/Button";
import { ImageUploader } from "@/components/ui/ImageUploader";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { teamFormSchema, type TeamFormValues } from "@/schemas/team.schema";
import type { Asset } from "@/types/api.types";
import type { Team } from "@/types/team.types";
import { applyFieldErrors } from "@/utils/forms";

export function TeamForm({
  team,
  submitting,
  onSubmit,
}: {
  team?: Team | null;
  submitting: boolean;
  onSubmit: (values: TeamFormValues, logo: Asset | null, poster: Asset | null) => Promise<void>;
}) {
  const [logo, setLogo] = useState<Asset | null>(team?.logo ?? null);
  const [poster, setPoster] = useState<Asset | null>(team?.poster ?? null);
  const form = useForm<TeamFormValues>({
    resolver: zodResolver(teamFormSchema) as Resolver<TeamFormValues>,
    defaultValues: {
      name: team?.name ?? "",
      shortName: team?.shortName ?? "",
      groupName: team?.groupName ?? "",
      status: team?.status ?? "active",
    },
  });

  return (
    <form
      className="grid gap-4"
      onSubmit={form.handleSubmit(async (values) => {
        try {
          await onSubmit(values, logo, poster);
        } catch (error) {
          applyFieldErrors(error, form.setError);
          throw error;
        }
      })}
    >
      <FormField label="Team name" required error={form.formState.errors.name?.message}>
        <Input {...form.register("name")} />
      </FormField>
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="Short name" error={form.formState.errors.shortName?.message}>
          <Input {...form.register("shortName")} placeholder="CS" />
        </FormField>
        <FormField label="Group" error={form.formState.errors.groupName?.message}>
          <Input {...form.register("groupName")} placeholder="Group A" />
        </FormField>
      </div>
      <FormField label="Status" error={form.formState.errors.status?.message}>
        <Select {...form.register("status")}>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </Select>
      </FormField>
      <ImageUploader label="Logo" purpose="team-logo" value={logo} onChange={setLogo} />
      <ImageUploader label="Poster" purpose="team-poster" value={poster} onChange={setPoster} />
      <Button type="submit" disabled={submitting}>
        {submitting ? "Saving…" : "Save team"}
      </Button>
    </form>
  );
}
