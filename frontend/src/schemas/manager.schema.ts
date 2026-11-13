// frontend/src/schemas/manager.schema.ts
import { z } from "zod";
import {
  mobileBase,
  nameBase,
  optionalDate,
  optionalEmail,
} from "@/schemas/common.schema";



export const managerRoleBase = z
  .string()
  .trim()
  .max(40, "Role cannot exceed 40 characters")
  .regex(
    /^(?:[A-Za-z]+(?:\s[A-Za-z]+)*)?$/,
    "Role can contain only letters and single spaces"
  )
  .transform((value) => value || null);


  
export const managerFormSchema = z
  .object({
    name: nameBase,
    mobile: mobileBase,
    email: optionalEmail,
    dateOfBirth: optionalDate,
    teamRef: z
      .string()
      .nullable()
      .transform((value) => value || null),
    role: managerRoleBase,
    status: z.enum(["active", "inactive"], {
      error: "Select a valid manager status",
    }),
  })
  .superRefine((value, ctx) => {
    if (value.status === "inactive" && value.teamRef) {
      ctx.addIssue({
        code: "custom",
        path: ["teamRef"],
        message: "Cannot assign a team to an inactive manager",
      });
    }
  });

export type ManagerFormValues = z.infer<typeof managerFormSchema>;