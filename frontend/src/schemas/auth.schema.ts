import { z } from "zod";
import { emailBase, mobileBase, passwordBase } from "@/schemas/common.schema";



const usernameBase = z
  .string()
  .trim()
  .toLowerCase()
  .regex(/^[a-z0-9_]{3,30}$/, "Enter a valid email, mobile number, or username");



export const loginSchema = z.object({
  identifier: z
    .string()
    .trim()
    .min(1, "Email, mobile number, or username is required")
    .refine(
      (val) =>
        emailBase.safeParse(val).success ||
        mobileBase.safeParse(val).success ||
        usernameBase.safeParse(val).success,
      "Enter a valid email address, 10-digit mobile number, or username"
    ),
  password: passwordBase,
});


export type LoginValues = z.infer<typeof loginSchema>;