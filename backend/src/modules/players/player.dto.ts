import { z } from "zod";

const objectIdSchema = z.string().regex(/^[a-f\\d]{24}$/i, "Invalid ID");
const optionalEmailSchema = z.union([z.email(), z.literal(""), z.null()])
  .optional()
  .transform((value) => typeof value === "string" && value.trim() ? value.trim().toLowerCase() : null);
const assetSchema = z.object({ url: z.url(), publicId: z.string().min(1) });

export const playerCreateSchema = z.object({
  name: z.string().trim().min(2).max(80),
  mobile: z.string().trim().min(7).max(20),
  email: optionalEmailSchema,
  dateOfBirth: z.coerce.date().nullable().optional(),
  position: z.enum(["GK", "DF", "MF", "FW"]),
  isIconPlayer: z.boolean().default(false),
  teamRef: objectIdSchema.nullable().optional(),
  jerseyNo: z.coerce.number().int().min(1).nullable().optional(),
  auctionPrice: z.coerce.number().min(0).default(0),
  auctionStatus: z.enum(["pending", "sold", "unsold"]).default("pending"),
  status: z.enum(["active", "inactive"]).default("active"),
  profilePic: assetSchema.nullable().optional(),
}).strict().superRefine((value, context) => {
  if (value.dateOfBirth && value.dateOfBirth > new Date()) {
    context.addIssue({ code: "custom", path: ["dateOfBirth"], message: "Date of birth cannot be in the future" });
  }
});

export const playerUpdateSchema = playerCreateSchema.partial().strict()
  .refine((value) => Object.keys(value).length > 0, "At least one player field is required")
  .superRefine((value, context) => {
    if (value.dateOfBirth && value.dateOfBirth > new Date()) {
      context.addIssue({ code: "custom", path: ["dateOfBirth"], message: "Date of birth cannot be in the future" });
    }
  });

export const playerAssignmentSchema = z.object({
  teamRef: objectIdSchema,
  auctionPrice: z.coerce.number().positive(),
  jerseyNo: z.coerce.number().int().min(1).nullable().optional(),
}).strict();

const optionalFilter = <T extends string>(values: readonly [T, ...T[]]) =>
  z.union([z.enum(values), z.literal("")]).optional().transform((value) => value || undefined);

export const playerQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  search: z.string().trim().max(100).optional(),
  position: optionalFilter(["GK", "DF", "MF", "FW"]),
  status: optionalFilter(["active", "inactive"]),
  auctionStatus: optionalFilter(["pending", "sold", "unsold"]),
  teamRef: z.union([objectIdSchema, z.literal("unassigned"), z.literal("")])
    .optional()
    .transform((value) => value || undefined),
}).strict();

export type PlayerCreateInput = z.infer<typeof playerCreateSchema>;
export type PlayerUpdateInput = z.infer<typeof playerUpdateSchema>;
export type PlayerAssignmentInput = z.infer<typeof playerAssignmentSchema>;
export type PlayerQueryInput = z.infer<typeof playerQuerySchema>;
