import { z } from "zod";
import { emailBase, passwordBase } from "@/schemas/common.schema";

export const loginSchema = z.object({
  email: emailBase,
  password: passwordBase,
});

export type LoginValues = z.infer<typeof loginSchema>;
