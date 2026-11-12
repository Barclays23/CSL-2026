import { Router } from "express";
import { authenticate } from "../../middlewares/authenticate.middleware.js";
import { requireAdmin } from "../../middlewares/authorizeAdmin.middleware.js";
import { auctionController } from "../../container/dependencies.js";



export const auctionRouter = Router();


auctionRouter.use(authenticate, requireAdmin);
auctionRouter.post("/start", auctionController.startAuction);
auctionRouter.post("/complete", auctionController.completeAuction);
auctionRouter.post("/reopen", auctionController.reopenAuction);
