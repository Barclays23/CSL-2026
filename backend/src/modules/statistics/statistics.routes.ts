import { Router } from "express";
import { statisticsController } from "../../container/dependencies.js";



export const statisticsRouter = Router();



statisticsRouter.get("/standings", statisticsController.getGroupStandings);
statisticsRouter.get("/top-scorers", statisticsController.getTopScorers);
statisticsRouter.get("/dashboard/summary", statisticsController.getDashboardStatistics);
