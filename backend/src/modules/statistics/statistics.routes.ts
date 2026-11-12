import { Router } from "express";
import { controllers } from "../../container/index.js";

export const statisticsRouter = Router();

statisticsRouter.get("/standings", controllers.statistics.getGroupStandings);
statisticsRouter.get("/top-scorers", controllers.statistics.getTopScorers);
statisticsRouter.get("/dashboard/summary", controllers.statistics.getDashboardStatistics);
