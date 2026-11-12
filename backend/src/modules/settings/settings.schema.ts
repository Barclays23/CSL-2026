import { z } from "zod";

export const settingsUpdateSchema = z.object({
  tournamentName: z.string().trim().min(2).max(100).optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  maxActivePlayers: z.coerce.number().int().min(1).max(200).optional(),
  maxActiveTeams: z.coerce.number().int().min(1).max(32).optional(),
  maxPlayersPerTeam: z.coerce.number().int().min(1).max(30).optional(),
  auctionBudgetPerTeam: z.coerce.number().min(0).max(1000000).optional(),
  requiredIconPlayers: z.coerce.number().int().min(0).max(11).optional(),
  requiredGoalkeepers: z.coerce.number().int().min(0).max(11).optional(),
  pointsRule: z.object({ win: z.coerce.number().min(0), draw: z.coerce.number().min(0), loss: z.coerce.number().min(0) }).optional(),
}).strict().refine((value) => Object.keys(value).length > 0, "At least one setting is required");
