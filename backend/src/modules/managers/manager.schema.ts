import { z } from "zod";

const optionalEmail = z.union([z.email(), z.literal(""), z.null()])
  .optional()
  .transform((value) => typeof value === "string" && value.trim() ? value.trim().toLowerCase() : null);

const optionalDateOfBirth = z.coerce.date()
  .nullable()
  .optional()
  .refine((value) => !value || value <= new Date(), "Date of birth cannot be in the future");

const managerFields = {
  name: z.string().trim().min(2).max(80),
  mobile: z.string().trim().min(7).max(20),
  email: optionalEmail,
  dateOfBirth: optionalDateOfBirth,
  teamRef: z.string().regex(/^[a-f\\d]{24}$/i).nullable().optional(),
  role: z.string().trim().max(40).nullable().optional(),
  profilePic: z.object({ url: z.url(), publicId: z.string().min(1) }).nullable().optional(),
  status: z.enum(["active", "inactive"]).default("active"),
};

export const managerCreateSchema = z.object(managerFields).strict();
export const managerUpdateSchema = z.object(managerFields).partial().strict()
  .refine((value) => Object.keys(value).length > 0, "At least one manager field is required");

export const managerQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().trim().max(100).optional(),
  status: z.enum(["active", "inactive"]).optional(),
  teamRef: z.string().regex(/^[a-f\\d]{24}$/i).optional(),
}).strict();
