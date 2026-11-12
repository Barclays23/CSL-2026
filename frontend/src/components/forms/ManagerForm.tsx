import { useState } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormField } from "@/components/forms/FormField";
import { Button } from "@/components/ui/Button";
import { ImageUploader } from "@/components/ui/ImageUploader";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { managerFormSchema, type ManagerFormValues } from "@/schemas/manager.schema";
import type { Asset } from "@/types/api.types";
import type { AdminManager, PublicManager } from "@/types/manager.types";
import type { Team } from "@/types/team.types";
import { applyFieldErrors, isAdminRecord } from "@/utils/forms";


export function ManagerForm({
  manager,
  teams,
  submitting,
  onSubmit,
}: {
  manager?: PublicManager | AdminManager | null;
  teams: Team[];
  submitting: boolean;
  onSubmit: (values: ManagerFormValues, photo: Asset | null) => Promise<void>;
}) {
  const admin = manager && isAdminRecord(manager) ? manager : null;
  const [photo, setPhoto] = useState<Asset | null>(manager?.profilePic ?? null);
  const form = useForm<ManagerFormValues>({
    resolver: zodResolver(managerFormSchema) as Resolver<ManagerFormValues>,
    defaultValues: {
      name: manager?.name ?? "",
      mobile: admin?.mobile ?? "",
      email: admin?.email ?? "",
      dateOfBirth: admin?.dateOfBirth ?? "",
      teamRef: manager?.teamRef ?? "",
      role: manager?.role ?? "Manager",
      status: manager?.status ?? "active",
    },
  });

  return (
    <form
      className="grid gap-4"
      onSubmit={form.handleSubmit(async (values) => {
        try {
          await onSubmit(values, photo);
        } catch (error) {
          applyFieldErrors(error, form.setError);
          throw error;
        }
      })}
    >
      <FormField label="Name" required error={form.formState.errors.name?.message}>
        <Input {...form.register("name")} />
      </FormField>
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="Mobile" required error={form.formState.errors.mobile?.message}>
          <Input {...form.register("mobile")} inputMode="tel" />
        </FormField>
        <FormField label="Email" error={form.formState.errors.email?.message}>
          <Input type="email" {...form.register("email")} />
        </FormField>
      </div>
      <FormField label="Date of birth" error={form.formState.errors.dateOfBirth?.message}>
        <Input type="date" {...form.register("dateOfBirth")} />
      </FormField>
      <FormField label="Team" error={form.formState.errors.teamRef?.message}>
        <Select {...form.register("teamRef")}>
          <option value="">Unassigned</option>
          {teams.map((team) => (
            <option key={team._id} value={team._id}>
              {team.name}
            </option>
          ))}
        </Select>
      </FormField>
      <FormField label="Role" error={form.formState.errors.role?.message}>
        <Input {...form.register("role")} placeholder="Manager" />
      </FormField>
      <FormField label="Status">
        <Select {...form.register("status")}>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </Select>
      </FormField>
      <ImageUploader label="Profile picture" purpose="manager-profile" value={photo} onChange={setPhoto} />
      <Button type="submit" disabled={submitting}>
        {submitting ? "Saving…" : "Save manager"}
      </Button>
    </form>
  );
}
