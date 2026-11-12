import { useState } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormField } from "@/components/forms/FormField";
import { Button } from "@/components/ui/Button";
import { ImageUploader } from "@/components/ui/ImageUploader";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { sponsorFormSchema, type SponsorFormValues } from "@/schemas/sponsor.schema";
import type { Asset } from "@/types/api.types";
import type { AdminSponsor, PublicSponsor } from "@/types/sponsor.types";
import { applyFieldErrors } from "@/utils/forms";

function isAdminSponsor(sponsor: PublicSponsor): sponsor is AdminSponsor {
  return "notes" in sponsor;
}

export function SponsorForm({
  sponsor,
  submitting,
  onSubmit,
}: {
  sponsor?: PublicSponsor | null;
  submitting: boolean;
  onSubmit: (values: SponsorFormValues, logo: Asset | null) => Promise<void>;
}) {
  const admin = sponsor && isAdminSponsor(sponsor) ? sponsor : null;
  const [logo, setLogo] = useState<Asset | null>(sponsor?.logo ?? null);
  const form = useForm<SponsorFormValues>({
    resolver: zodResolver(sponsorFormSchema) as Resolver<SponsorFormValues>,
    defaultValues: {
      name: sponsor?.name ?? "",
      tier: sponsor?.tier ?? "",
      website: sponsor?.website ?? "",
      contactPerson: admin?.contactPerson ?? "",
      contactMobile: admin?.contactMobile ?? "",
      notes: admin?.notes ?? "",
      status: sponsor?.status ?? "active",
    },
  });

  return (
    <form
      className="grid gap-4"
      onSubmit={form.handleSubmit(async (values) => {
        try {
          await onSubmit(values, logo);
        } catch (error) {
          applyFieldErrors(error, form.setError);
          throw error;
        }
      })}
    >
      <FormField label="Name" required error={form.formState.errors.name?.message}>
        <Input {...form.register("name")} />
      </FormField>
      <FormField label="Tier" error={form.formState.errors.tier?.message}>
        <Input {...form.register("tier")} placeholder="Gold" />
      </FormField>
      <FormField label="Website" error={form.formState.errors.website?.message}>
        <Input {...form.register("website")} placeholder="https://" />
      </FormField>
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="Contact person" error={form.formState.errors.contactPerson?.message}>
          <Input {...form.register("contactPerson")} />
        </FormField>
        <FormField label="Contact mobile" error={form.formState.errors.contactMobile?.message}>
          <Input {...form.register("contactMobile")} />
        </FormField>
      </div>
      <FormField label="Internal notes" hint="Visible only to the admin." error={form.formState.errors.notes?.message}>
        <Textarea {...form.register("notes")} />
      </FormField>
      <FormField label="Status">
        <Select {...form.register("status")}>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </Select>
      </FormField>
      <ImageUploader label="Logo" purpose="sponsor" value={logo} onChange={setLogo} />
      <Button type="submit" disabled={submitting}>
        {submitting ? "Saving…" : "Save sponsor"}
      </Button>
    </form>
  );
}
