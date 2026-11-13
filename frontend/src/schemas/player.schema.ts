// frontend/src/schemas/player.schema.ts
import { z } from "zod";
import {
  auctionPriceBase,
  jerseyNoBase,
  mobileBase,
  nameBase,
  optionalDate,
  optionalEmail,
} from "@/schemas/common.schema";

export const playerPositionSchema = z
  .string()
  .min(1, "Select a player position")
  .pipe(
    z.enum(["GK", "DF", "MF", "FW"], {
      error: "Select a valid player position",
    })
  );

export const playerFormSchema = z
  .object({
    name: nameBase,
    mobile: mobileBase,
    email: optionalEmail,
    dateOfBirth: optionalDate,
    position: playerPositionSchema,
    isIconPlayer: z.boolean(),
    teamRef: z
      .string()
      .nullable()
      .transform((value) => value || null),
    jerseyNo: jerseyNoBase,
    auctionPrice: auctionPriceBase,
    auctionStatus: z.enum(["pending", "sold", "unsold"], {
      error: "Select a valid auction status",
    }),
    status: z.enum(["active", "inactive"], {
      error: "Select a valid player status",
    }),
  })
  .superRefine((value, ctx) => {
    // 1. Inactive player rules
    if (value.status === "inactive") {
      if (value.isIconPlayer) {
        ctx.addIssue({
          code: "custom",
          path: ["isIconPlayer"],
          message: "Inactive players cannot be marked as icon players",
        });
      }
      if (value.auctionStatus !== "pending") {
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
      if (value.jerseyNo !== null) {
        ctx.addIssue({
          code: "custom",
          path: ["jerseyNo"],
          message: "Cannot assign a jersey number to an inactive player",
        });
      }
      if (value.auctionPrice > 0) {
        ctx.addIssue({
          code: "custom",
          path: ["auctionPrice"],
          message: "Cannot assign an auction price to an inactive player",
        });
      }
      return;
    }

    // 2. Active + Sold player rules
    if (value.auctionStatus === "sold") {
      if (!value.teamRef) {
        ctx.addIssue({
          code: "custom",
          path: ["teamRef"],
          message: "A sold player must be assigned to a team",
        });
      }
      if (value.auctionPrice <= 0) {
        ctx.addIssue({
          code: "custom",
          path: ["auctionPrice"],
          message: "A sold player must have an auction price greater than zero",
        });
      }
      if (value.jerseyNo !== null && !value.teamRef) {
        ctx.addIssue({
          code: "custom",
          path: ["jerseyNo"],
          message: "Assign a team before setting a jersey number",
        });
      }
      return;
    }

    // 3. Active + Pending / Unsold player rules
    if (value.teamRef) {
      ctx.addIssue({
        code: "custom",
        path: ["teamRef"],
        message: "Only sold players can be assigned to a team",
      });
    }
    if (value.jerseyNo !== null) {
      ctx.addIssue({
        code: "custom",
        path: ["jerseyNo"],
        message: "Only sold players with a team can have a jersey number",
      });
    }
    if (value.auctionPrice !== 0) {
      ctx.addIssue({
        code: "custom",
        path: ["auctionPrice"],
        message: "Pending and unsold players must have an auction price of 0",
      });
    }
  });

export type PlayerFormValues = z.infer<typeof playerFormSchema>;