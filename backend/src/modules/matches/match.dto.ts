import { z } from "zod";
const id=z.string().regex(/^[a-f\d]{24}$/i);
const shootout=z.object({team1Score:z.coerce.number().int().min(0),team2Score:z.coerce.number().int().min(0)});
export const matchCreateSchema=z.object({
  matchNo:z.union([z.string().trim().min(1).max(12),z.number().int().positive()]).transform(String),
  stage:z.enum(["group","quarter_final","semi_final","final"]),
  groupName:z.string().trim().max(40).nullable().optional(),
  kickoffAt:z.coerce.date(),venue:z.string().trim().max(100).nullable().optional(),
  team1Ref:id,team2Ref:id,status:z.enum(["scheduled","live","completed","postponed","cancelled"]).default("scheduled"),
  penaltyShootout:shootout.nullable().optional(),notes:z.string().trim().max(500).nullable().optional()
}).strict().refine(v=>v.team1Ref!==v.team2Ref,{path:["team2Ref"],message:"Choose two different teams"});
export const matchUpdateSchema=z.object({
  matchNo:z.union([z.string().trim().min(1).max(12),z.number().int().positive()]).transform(String).optional(),
  stage:z.enum(["group","quarter_final","semi_final","final"]).optional(),
  groupName:z.string().trim().max(40).nullable().optional(),kickoffAt:z.coerce.date().optional(),
  venue:z.string().trim().max(100).nullable().optional(),team1Ref:id.optional(),team2Ref:id.optional(),
  status:z.enum(["scheduled","live","completed","postponed","cancelled"]).optional(),
  penaltyShootout:shootout.nullable().optional(),notes:z.string().trim().max(500).nullable().optional()
}).strict().refine(v=>Object.keys(v).length>0,"At least one field is required").refine(v=>!v.team1Ref||!v.team2Ref||v.team1Ref!==v.team2Ref,{path:["team2Ref"],message:"Choose two different teams"});
const optionalFilter=<T extends string>(values:readonly [T,...T[]])=>z.union([z.enum(values),z.literal("")]).optional().transform(v=>v||undefined);
export const matchQuerySchema=z.object({
  page:z.coerce.number().int().min(1).default(1),limit:z.coerce.number().int().min(1).max(100).default(20),
  stage:optionalFilter(["group","quarter_final","semi_final","final"]),
  groupName:z.string().optional(),status:optionalFilter(["scheduled","live","completed","postponed","cancelled"]),
  search:z.string().trim().optional()
});
export const goalSchema=z.object({
  scoringTeamRef:id,goalType:z.enum(["normal","own_goal"]),
  scorerRef:id.nullable().optional(),ownGoalPlayerRef:id.nullable().optional()
}).strict();
