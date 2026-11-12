import { Router } from "express";
import { authenticate } from "../../middlewares/authenticate.middleware.js";
import { optionalAuthenticate } from "../../middlewares/optionalAuthenticate.middleware.js";
import { requireAdmin } from "../../middlewares/authorizeAdmin.middleware.js";
import { validate } from "../../middlewares/validate.middleware.js";
import { sponsorController } from "../../container/dependencies.js";
import { getSponsorsQuerySchema, sponsorCreateSchema, sponsorUpdateSchema } from "./sponsor.dto.js";




export const sponsorRouter = Router();



sponsorRouter.get("/", optionalAuthenticate, validate(getSponsorsQuerySchema, "query"), sponsorController.getSponsors);
sponsorRouter.get("/:id", optionalAuthenticate, sponsorController.getSponsorById);
sponsorRouter.post("/", authenticate, requireAdmin, validate(sponsorCreateSchema), sponsorController.createSponsor);
sponsorRouter.patch("/:id", authenticate, requireAdmin, validate(sponsorUpdateSchema), sponsorController.updateSponsor);
sponsorRouter.delete("/:id", authenticate, requireAdmin, sponsorController.deleteSponsor);
