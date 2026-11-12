import { z } from "zod";

const objectIdSchema = z.string().regex(/^[a-f\d]{24}$/i, "Invalid ID");

const optionalEmailSchema = z
  .union([z.email(), z.literal(""), z.null()])
  .optional()
  .transform((value) =>
    typeof value === "string" && value.trim() ? value.trim().toLowerCase() : null
  );

const assetSchema = z.object({
  url: z.url(),
  publicId: z.string().min(1),
});

const dateOfBirthSchema = z.coerce
  .date()
  .refine((date) => date <= new Date(), {
    message: "Date of birth cannot be in the future",
  })
  .nullable()
  .optional();

// 1. Pure base object without defaults or top-level refinements
const playerBaseSchema = z.object({
  name: z.string().trim().min(5).max(20),
  mobile: z.string().trim().min(10).max(10),
  email: optionalEmailSchema,
  dateOfBirth: dateOfBirthSchema,
  position: z.enum(["GK", "DF", "MF", "FW"]),
  isIconPlayer: z.boolean(),
  teamRef: objectIdSchema.nullable().optional(),
  jerseyNo: z.coerce.number().int().min(1).nullable().optional(),
  auctionPrice: z.coerce.number().min(0),
  auctionStatus: z.enum(["pending", "sold", "unsold"]),
  status: z.enum(["active", "inactive"]),
  profilePic: assetSchema.nullable().optional(),
});

// 2. Create schema adds creation defaults and strict check
export const playerCreateSchema = playerBaseSchema
  .extend({
    isIconPlayer: z.boolean().default(false),
    auctionPrice: z.coerce.number().min(0).default(0),
    auctionStatus: z.enum(["pending", "sold", "unsold"]).default("pending"),
    status: z.enum(["active", "inactive"]).default("active"),
  })
  .strict();

// 3. Update schema makes all fields truly optional (no defaults injected)
export const playerUpdateSchema = playerBaseSchema
  .partial()
  .strict()
  .refine((value) => Object.keys(value).length > 0, {
    message: "At least one player field is required",
  });

export const playerAssignmentSchema = z
  .object({
    teamRef: objectIdSchema,
    auctionPrice: z.coerce.number().positive(),
    jerseyNo: z.coerce.number().int().min(1).nullable().optional(),
  })
  .strict();

const optionalFilter = <T extends string>(values: readonly [T, ...T[]]) =>
  z
    .union([z.enum(values), z.literal("")])
    .optional()
    .transform((value) => value || undefined);

export const playerQuerySchema = z
  .object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(10),
    search: z.string().trim().max(20).optional(),
    position: optionalFilter(["GK", "DF", "MF", "FW"]),
    status: optionalFilter(["active", "inactive"]),
    auctionStatus: optionalFilter(["pending", "sold", "unsold"]),
    teamRef: z
      .union([objectIdSchema, z.literal("unassigned"), z.literal("")])
      .optional()
      .transform((value) => value || undefined),
  })
  .strict();

export type PlayerCreateInput = z.infer<typeof playerCreateSchema>;
export type PlayerUpdateInput = z.infer<typeof playerUpdateSchema>;
export type PlayerAssignmentInput = z.infer<typeof playerAssignmentSchema>;
export type PlayerQueryInput = z.infer<typeof playerQuerySchema>;