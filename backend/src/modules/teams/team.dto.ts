import { z } from "zod";
const asset=z.object({url:z.url(),publicId:z.string().min(1)}).nullable();
export const teamCreateSchema=z.object({
  name:z.string().trim().min(2).max(80),
  shortName:z.string().trim().max(8).nullable().optional(),
  logo:asset.optional(),
  poster:asset.optional(),
  groupName:z.string().trim().max(40).nullable().optional(),
  status:z.enum(["active","inactive"]).default("active")
}).strict();
export const teamUpdateSchema=teamCreateSchema.partial().strict();
export const teamQuerySchema=z.object({
  page:z.coerce.number().int().min(1).default(1),
  limit:z.coerce.number().int().min(1).max(100).default(50),
  search:z.string().trim().optional(),
  status:z.enum(["active","inactive"]).optional(),
  groupName:z.string().optional()
});
export type TeamCreateInput=z.infer<typeof teamCreateSchema>;
export type TeamUpdateInput=z.infer<typeof teamUpdateSchema>;
