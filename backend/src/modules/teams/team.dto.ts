import { z } from "zod";
const assetSchema = z.object({ url: z.url(), publicId: z.string().min(1) }).nullable();
export const teamCreateSchema = z.object({
  name: z.string().trim().min(2).max(80), shortName: z.string().trim().max(8).nullable().optional(),
  logo: assetSchema.optional(), poster: assetSchema.optional(), groupName: z.string().trim().max(40).nullable().optional(),
  status: z.enum(["active", "inactive"]).default("active"),
}).strict();
export const teamUpdateSchema = teamCreateSchema.partial().strict().refine((value) => Object.keys(value).length > 0, "At least one field is required");
export const teamQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1), limit: z.coerce.number().int().min(1).max(100).default(50),
  search: z.string().trim().optional(), status: z.enum(["active", "inactive"]).optional(), groupName: z.string().trim().optional(),
}).strict();
export type TeamCreateInput = z.infer<typeof teamCreateSchema>;
export type TeamUpdateInput = z.infer<typeof teamUpdateSchema>;
export type TeamQueryInput = z.infer<typeof teamQuerySchema>;
