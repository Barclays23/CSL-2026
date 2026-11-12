import { z } from "zod";

export const sponsorCreateSchema = z.object({
  name: z.string().trim().min(2).max(100),
  logo: z.object({ url: z.url(), publicId: z.string().min(1) }).nullable().optional(),
  tier: z.string().trim().max(40).nullable().optional(),
  website: z.union([z.url(), z.literal(""), z.null()]).optional().transform((value) => value || null),
  contactPerson: z.string().trim().max(80).nullable().optional(),
  contactMobile: z.string().trim().max(20).nullable().optional(),
  notes: z.string().trim().max(500).nullable().optional(),
  status: z.enum(["active", "inactive"]).default("active"),
}).strict();

export const sponsorUpdateSchema = sponsorCreateSchema.partial().strict();
export const getSponsorsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(50),
  search: z.string().trim().max(100).optional(),
  status: z.enum(["active", "inactive"]).optional(),
}).strict();

export type SponsorCreateDTO = z.infer<typeof sponsorCreateSchema>;
export type SponsorUpdateDTO = z.infer<typeof sponsorUpdateSchema>;
export type GetSponsorsQueryDTO = z.infer<typeof getSponsorsQuerySchema>;
