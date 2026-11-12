import { Router } from "express";
import { controllers } from "../../container/index.js";
export const statisticsRouter=Router();
statisticsRouter.get("/standings",controllers.statistics.standings);
statisticsRouter.get("/top-scorers",controllers.statistics.topScorers);
statisticsRouter.get("/dashboard/summary",controllers.statistics.dashboard);
