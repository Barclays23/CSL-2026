import { z } from "zod";

export const loginSchema = z.object({
  email: z.email().transform((value) => value.trim().toLowerCase()),
  password: z.string().min(1),
}).strict();
