import { z } from "zod";

export const adminUserCreateSchema = z.object({
  name: z.string().trim().min(2).max(80),
  email: z.email().trim().toLowerCase(),
  password: z.string().min(10).max(128),
}).strict();
