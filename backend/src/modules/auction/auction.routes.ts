import { Router } from "express";
import { authenticate } from "../../middlewares/authenticate.middleware.js";
import { requireAdmin } from "../../middlewares/authorizeAdmin.middleware.js";
import { controllers } from "../../container/index.js";

export const auctionRouter = Router();

auctionRouter.use(authenticate, requireAdmin);
auctionRouter.post("/start", controllers.auction.startAuction);
auctionRouter.post("/complete", controllers.auction.completeAuction);
auctionRouter.post("/reopen", controllers.auction.reopenAuction);
