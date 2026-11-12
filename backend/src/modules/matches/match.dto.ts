import { z } from "zod";

const objectIdSchema = z.string().regex(/^[a-f\\d]{24}$/i, "Invalid ID");
const shootoutSchema = z.object({
  team1Score: z.coerce.number().int().min(0),
  team2Score: z.coerce.number().int().min(0),
}).strict();

const matchFields = {
  matchNo: z.union([z.string().trim().min(1).max(12), z.coerce.number().int().positive()]).transform(String),
  stage: z.enum(["group", "quarter_final", "semi_final", "final"]),
  groupName: z.string().trim().max(40).nullable().optional(),
  kickoffAt: z.coerce.date(),
  venue: z.string().trim().max(100).nullable().optional(),
  team1Ref: objectIdSchema,
  team2Ref: objectIdSchema,
  status: z.enum(["scheduled", "live", "completed", "postponed", "cancelled"]).default("scheduled"),
  penaltyShootout: shootoutSchema.nullable().optional(),
  notes: z.string().trim().max(500).nullable().optional(),
};

export const matchCreateSchema = z.object(matchFields).strict()
  .refine((value) => value.team1Ref !== value.team2Ref, {
    path: ["team2Ref"],
    message: "Choose two different teams",
  });

export const matchUpdateSchema = z.object({
  matchNo: matchFields.matchNo.optional(),
  stage: matchFields.stage.optional(),
  groupName: matchFields.groupName,
  kickoffAt: matchFields.kickoffAt.optional(),
  venue: matchFields.venue,
  team1Ref: objectIdSchema.optional(),
  team2Ref: objectIdSchema.optional(),
  status: z.enum(["scheduled", "live", "completed", "postponed", "cancelled"]).optional(),
  penaltyShootout: shootoutSchema.nullable().optional(),
  notes: z.string().trim().max(500).nullable().optional(),
}).strict()
  .refine((value) => Object.keys(value).length > 0, "At least one match field is required")
  .refine((value) => !value.team1Ref || !value.team2Ref || value.team1Ref !== value.team2Ref, {
    path: ["team2Ref"],
    message: "Choose two different teams",
  });

export const matchQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  stage: z.enum(["group", "quarter_final", "semi_final", "final"]).optional(),
  groupName: z.string().trim().max(40).optional(),
  status: z.enum(["scheduled", "live", "completed", "postponed", "cancelled"]).optional(),
  search: z.string().trim().max(100).optional(),
}).strict();

export const goalSchema = z.object({
  scoringTeamRef: objectIdSchema,
  goalType: z.enum(["normal", "own_goal"]),
  scorerRef: objectIdSchema.nullable().optional(),
  ownGoalPlayerRef: objectIdSchema.nullable().optional(),
}).strict().superRefine((value, context) => {
  if (value.goalType === "normal" && !value.scorerRef) {
    context.addIssue({ code: "custom", path: ["scorerRef"], message: "Select the goal scorer" });
  }
  if (value.goalType === "own_goal" && !value.ownGoalPlayerRef) {
    context.addIssue({ code: "custom", path: ["ownGoalPlayerRef"], message: "Select the own-goal player" });
  }
});

export type MatchCreateInput = z.infer<typeof matchCreateSchema>;
export type MatchUpdateInput = z.infer<typeof matchUpdateSchema>;
export type MatchQueryInput = z.infer<typeof matchQuerySchema>;
export type GoalInput = z.infer<typeof goalSchema>;
