import { z } from "zod";
import { nameBase, optionalMobile, optionalUrl } from "@/schemas/common.schema";

export const sponsorFormSchema = z.object({
  name: nameBase,
  tier: z
    .string()
    .trim()
    .max(40)
    .transform((value) => value || null),
  website: optionalUrl,
  contactPerson: z
    .string()
    .trim()
    .max(80)
    .transform((value) => value || null),
  contactMobile: optionalMobile,
  notes: z
    .string()
    .trim()
    .max(400)
    .transform((value) => value || null),
  status: z.enum(["active", "inactive"]),
});

export type SponsorFormValues = z.infer<typeof sponsorFormSchema>;
