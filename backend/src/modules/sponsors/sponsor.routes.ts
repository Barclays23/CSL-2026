import { Router } from "express";
import { authenticate } from "../../middlewares/authenticate.middleware.js";
import { optionalAuthenticate } from "../../middlewares/optionalAuthenticate.middleware.js";
import { requireAdmin } from "../../middlewares/authorizeAdmin.middleware.js";
import { validate } from "../../middlewares/validate.middleware.js";
import { controllers } from "../../container/index.js";
import { getSponsorsQuerySchema, sponsorCreateSchema, sponsorUpdateSchema } from "./sponsor.dto.js";

export const sponsorRouter = Router();
sponsorRouter.get("/", optionalAuthenticate, validate(getSponsorsQuerySchema, "query"), controllers.sponsors.getSponsors);
sponsorRouter.get("/:id", optionalAuthenticate, controllers.sponsors.getSponsorById);
sponsorRouter.post("/", authenticate, requireAdmin, validate(sponsorCreateSchema), controllers.sponsors.createSponsor);
sponsorRouter.patch("/:id", authenticate, requireAdmin, validate(sponsorUpdateSchema), controllers.sponsors.updateSponsor);
sponsorRouter.delete("/:id", authenticate, requireAdmin, controllers.sponsors.deleteSponsor);
