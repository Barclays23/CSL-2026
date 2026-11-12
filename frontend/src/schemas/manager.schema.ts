import { z } from "zod";
import { mobileBase, nameBase, optionalDate, optionalEmail } from "@/schemas/common.schema";

export const managerFormSchema = z.object({
  name: nameBase,
  mobile: mobileBase,
  email: optionalEmail,
  dateOfBirth: optionalDate,
  teamRef: z
    .string()
    .nullable()
    .transform((value) => value || null),
  role: z
    .string()
    .trim()
    .max(40, "Role is too long")
    .transform((value) => value || null),
  status: z.enum(["active", "inactive"]),
});

export type ManagerFormValues = z.infer<typeof managerFormSchema>;
