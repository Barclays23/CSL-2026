// backend/src/modules/players/player.schema.ts
import { z } from "zod";
import {
  assetSchema,
  auctionPriceBase,
  jerseyNoBase,
  mobileBase,
  nameBase,
  objectIdSchema,
  optionalDate,
  optionalEmail,
} from "../../shared/schemas/common.schema.js";

const playerPositionSchema = z
  .string()
  .min(1, "Select a player position")
  .pipe(
    z.enum(["GK", "DF", "MF", "FW"], {
      error: "Select a valid player position",
    })
  );

// 1. Pure base object without defaults or object-level refinements (Zod v4 compatible)
const playerBaseSchema = z.object({
  name: nameBase,
  mobile: mobileBase,
  email: optionalEmail,
  dateOfBirth: optionalDate,
  position: playerPositionSchema,
  isIconPlayer: z.boolean(),
  teamRef: objectIdSchema.nullable().optional(),
  jerseyNo: jerseyNoBase,
  auctionPrice: auctionPriceBase,
  auctionStatus: z.enum(["pending", "sold", "unsold"], {
    error: "Select a valid auction status",
  }),
  status: z.enum(["active", "inactive"], {
    error: "Select a valid player status",
  }),
  profilePic: assetSchema.nullable().optional(),
});

// Shared cross-field refinement for both Create and Update
const validatePlayerStateRules = (
  value: Partial<z.infer<typeof playerBaseSchema>>,
  ctx: z.RefinementCtx
): void => {
  if (value.status === "inactive") {
    if (value.isIconPlayer) {
      ctx.addIssue({
        code: "custom",
        path: ["isIconPlayer"],
        message: "Inactive players cannot be marked as icon players",
      });
    }
    if (value.auctionStatus && value.auctionStatus !== "pending") {
      ctx.addIssue({
        code: "custom",
        path: ["auctionStatus"],
        message: "Inactive players must have a pending auction status",
      });
    }
    if (value.teamRef) {
      ctx.addIssue({
        code: "custom",
        path: ["teamRef"],
        message: "Cannot assign a team to an inactive player",
      });
    }
    if (value.jerseyNo !== undefined && value.jerseyNo !== null) {
      ctx.addIssue({
        code: "custom",
        path: ["jerseyNo"],
        message: "Cannot assign a jersey number to an inactive player",
      });
    }
    if (value.auctionPrice !== undefined && value.auctionPrice > 0) {
      ctx.addIssue({
        code: "custom",
        path: ["auctionPrice"],
        message: "Cannot assign an auction price to an inactive player",
      });
    }
    return;
  }

  if (value.auctionStatus === "sold") {
    if (value.teamRef === null || value.teamRef === undefined) {
      ctx.addIssue({
        code: "custom",
        path: ["teamRef"],
        message: "A sold player must be assigned to a team",
      });
    }
    if (value.auctionPrice !== undefined && value.auctionPrice <= 0) {
      ctx.addIssue({
        code: "custom",
        path: ["auctionPrice"],
        message: "A sold player must have an auction price greater than zero",
      });
    }
    return;
  }

  if (value.teamRef) {
    ctx.addIssue({
      code: "custom",
      path: ["teamRef"],
      message: "Only sold players can be assigned to a team",
    });
  }
  if (value.jerseyNo !== undefined && value.jerseyNo !== null) {
    ctx.addIssue({
      code: "custom",
      path: ["jerseyNo"],
      message: "Only sold players with a team can have a jersey number",
    });
  }
  if (value.auctionPrice !== undefined && value.auctionPrice !== 0) {
    ctx.addIssue({
      code: "custom",
      path: ["auctionPrice"],
      message: "Pending and unsold players must have an auction price of 0",
    });
  }
};

// 2. Create Schema
export const playerCreateSchema = playerBaseSchema
  .extend({
    isIconPlayer: z.boolean().default(false),
    auctionPrice: auctionPriceBase.default(0),
    auctionStatus: z.enum(["pending", "sold", "unsold"]).default("pending"),
    status: z.enum(["active", "inactive"]).default("active"),
  })
  .strict()
  .superRefine(validatePlayerStateRules);

// 3. Update Schema
export const playerUpdateSchema = playerBaseSchema
  .partial()
  .strict()
  .refine((value) => Object.keys(value).length > 0, {
    message: "At least one player field is required",
  })
  .superRefine(validatePlayerStateRules);

// 4. Direct Auction Assignment Schema
export const playerAssignmentSchema = z
  .object({
    teamRef: objectIdSchema,
    auctionPrice: z.coerce
      .number()
      .positive("Auction price must be greater than zero")
      .max(100000, "Auction price cannot exceed ₹1,00,000"),
    jerseyNo: jerseyNoBase.optional(),
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
    search: z.string().trim().max(40).optional(),
    position: optionalFilter(["GK", "DF", "MF", "FW"]),
    status: optionalFilter(["active", "inactive"]),
    auctionStatus: optionalFilter(["pending", "sold", "unsold"]),
    teamRef: z
      .union([objectIdSchema, z.literal("unassigned"), z.literal("")])
      .optional()
      .transform((value) => value || undefined),
  })
  .strict();