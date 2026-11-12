import { z } from "zod";
import { nameBase } from "@/schemas/common.schema";

const count = (label: string, max: number) =>
  z.coerce.number().int(`${label} must be a whole number`).min(0, `${label} cannot be negative`).max(max);

export const settingsFormSchema = z
  .object({
    tournamentName: nameBase,
    startDate: z.string().min(1, "Start date is required"),
    endDate: z.string().min(1, "End date is required"),
    maxActivePlayers: count("Player limit", 200),
    maxActiveTeams: count("Team limit", 32),
    maxPlayersPerTeam: count("Squad size", 30),
    auctionBudgetPerTeam: count("Budget", 1_000_000),
    requiredIconPlayers: count("Icon players", 11),
    requiredGoalkeepers: count("Goalkeepers", 11),
    win: count("Win points", 20),
    draw: count("Draw points", 20),
    loss: count("Loss points", 20),
  })
  .superRefine((value, ctx) => {
    if (value.endDate < value.startDate) {
      ctx.addIssue({ code: "custom", path: ["endDate"], message: "End date must be on or after the start date" });
    }
  });

export type SettingsFormValues = z.infer<typeof settingsFormSchema>;
