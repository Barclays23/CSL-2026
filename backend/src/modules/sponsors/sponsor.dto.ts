import { z } from "zod";
export const sponsorCreateSchema=z.object({
  name:z.string().trim().min(2).max(100),
  logo:z.object({url:z.url(),publicId:z.string()}).nullable().optional(),
  tier:z.string().trim().max(40).nullable().optional(),
  website:z.union([z.url(),z.literal(""),z.null()]).optional().transform(v=>v||null),
  contactPerson:z.string().trim().max(80).nullable().optional(),
  contactMobile:z.string().trim().max(20).nullable().optional(),
  notes:z.string().trim().max(500).nullable().optional(),
  status:z.enum(["active","inactive"]).default("active")
}).strict();
export const sponsorUpdateSchema=sponsorCreateSchema.partial().strict();
