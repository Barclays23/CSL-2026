import { z } from "zod";
import { isKnockout } from "@/constants/football";

const optionalScore = z
  .union([z.string(), z.number(), z.null(), z.undefined()])
  .transform((value) => {
    if (value === "" || value === null || value === undefined) return null;
    return typeof value === "number" ? value : Number(value);
  });

export const matchFormSchema = z
  .object({
    matchNo: z.string().trim().min(1, "Match number is required").max(12, "Match number is too long"),
    stage: z.enum(["group", "quarter_final", "semi_final", "final"]),
    groupName: z.string().trim().max(40).transform((value) => value || null),
    kickoffAt: z.string().min(1, "Kick-off is required"),
    venue: z.string().trim().max(80).transform((value) => value || null),
    team1Ref: z.string().min(1, "Choose the home team"),
    team2Ref: z.string().min(1, "Choose the away team"),
    status: z.enum(["scheduled", "live", "completed", "postponed", "cancelled"]),
    team1Shootout: optionalScore,
    team2Shootout: optionalScore,
    notes: z.string().trim().max(400).transform((value) => value || null),
  })
  .superRefine((value, ctx) => {
    if (value.team1Ref && value.team1Ref === value.team2Ref) {
      ctx.addIssue({ code: "custom", path: ["team2Ref"], message: "Choose two different teams" });
    }
    if (value.stage === "group" && !value.groupName) {
      ctx.addIssue({ code: "custom", path: ["groupName"], message: "Group fixtures need a group name" });
    }
    const hasShootout = value.team1Shootout !== null || value.team2Shootout !== null;
    if (value.stage === "group" && hasShootout) {
      ctx.addIssue({
        code: "custom",
        path: ["team1Shootout"],
        message: "Group matches do not use a penalty shootout",
      });
    }
    if (hasShootout && !isKnockout(value.stage)) return;
    if (hasShootout) {
      for (const key of ["team1Shootout", "team2Shootout"] as const) {
        const score = value[key];
        if (score === null || !Number.isInteger(score) || score < 0) {
          ctx.addIssue({ code: "custom", path: [key], message: "Shootout scores must be whole numbers" });
        }
      }
      if (
        value.team1Shootout !== null &&
        value.team2Shootout !== null &&
        value.team1Shootout === value.team2Shootout
      ) {
        ctx.addIssue({
          code: "custom",
          path: ["team2Shootout"],
          message: "A shootout needs a winner",
        });
      }
    }
  });

export type MatchFormValues = z.infer<typeof matchFormSchema>;

export const goalFormSchema = z
  .object({
    scoringTeamRef: z.string().min(1, "Choose the team credited with the goal"),
    goalType: z.enum(["normal", "own_goal"]),
    scorerRef: z.string(),
    ownGoalPlayerRef: z.string(),
  })
  .superRefine((value, ctx) => {
    if (value.goalType === "own_goal" && !value.ownGoalPlayerRef) {
      ctx.addIssue({
        code: "custom",
        path: ["ownGoalPlayerRef"],
        message: "Choose the player who scored the own goal",
      });
    }
  });

export type GoalFormValues = z.infer<typeof goalFormSchema>;
