import { z } from "zod";
import {
  auctionPriceBase,
  jerseyNoBase,
  mobileBase,
  nameBase,
  optionalDate,
  optionalEmail,
} from "@/schemas/common.schema";

export const playerFormSchema = z
  .object({
    name: nameBase,
    mobile: mobileBase,
    email: optionalEmail,
    dateOfBirth: optionalDate,
    position: z.enum(["GK", "DF", "MF", "FW"]),
    isIconPlayer: z.boolean(),
    teamRef: z
      .string()
      .nullable()
      .transform((value) => value || null),
    jerseyNo: jerseyNoBase,
    auctionPrice: auctionPriceBase,
    auctionStatus: z.enum(["pending", "sold", "unsold"]),
    status: z.enum(["active", "inactive"]),
  })
  .superRefine((value, ctx) => {
    if (value.status === "inactive") return;
    if (value.auctionStatus === "sold") {
      if (!value.teamRef) {
        ctx.addIssue({ code: "custom", path: ["teamRef"], message: "A sold player must be assigned to a team" });
      }
      if (value.auctionPrice <= 0) {
        ctx.addIssue({
          code: "custom",
          path: ["auctionPrice"],
          message: "A sold player needs an auction price above zero",
        });
      }
      return;
    }
    if (value.teamRef) {
      ctx.addIssue({
        code: "custom",
        path: ["teamRef"],
        message: "Pending and unsold players cannot stay assigned to a team",
      });
    }
    if (value.jerseyNo !== null) {
      ctx.addIssue({
        code: "custom",
        path: ["jerseyNo"],
        message: "Clear the jersey number unless the player is sold",
      });
    }
    if (value.auctionPrice !== 0) {
      ctx.addIssue({
        code: "custom",
        path: ["auctionPrice"],
        message: "Pending and unsold players must have a zero auction price",
      });
    }
  });

export type PlayerFormValues = z.infer<typeof playerFormSchema>;
