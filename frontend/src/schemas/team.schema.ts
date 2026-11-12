import { z } from "zod";
import { teamNameBase } from "@/schemas/common.schema";

export const teamFormSchema = z.object({
  name: teamNameBase,
  shortName: z
    .string()
    .trim()
    .max(8, "Short name must be 8 characters or fewer")
    .transform((value) => value || null),
  groupName: z
    .string()
    .trim()
    .max(40, "Group name is too long")
    .transform((value) => value || null),
  status: z.enum(["active", "inactive"]),
});

export type TeamFormValues = z.infer<typeof teamFormSchema>;
