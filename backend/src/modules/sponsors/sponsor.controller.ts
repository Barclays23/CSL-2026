import type { RequestHandler } from "express";
import { asyncHandler } from "../../shared/utils/asyncHandler.js";
import { sendSuccess } from "../../shared/responses/response.helper.js";
import { SponsorService } from "./sponsor.service.js";
import { getSponsorsQuerySchema, sponsorCreateSchema, sponsorUpdateSchema } from "./sponsor.dto.js";

export class SponsorController {
  constructor(private readonly sponsorService: SponsorService) {}

  getSponsors: RequestHandler = asyncHandler(async (request, response) => {
    const query = getSponsorsQuerySchema.parse(request.query);
    const isAdmin = Boolean(request.user);
    const result = await this.sponsorService.getSponsors(query, isAdmin);
    sendSuccess(response, result.items, "Sponsors fetched", 200, {
      page: result.page,
      limit: result.limit,
      total: result.total,
      totalPages: Math.ceil(result.total / result.limit),
    });
  });

  getSponsorById: RequestHandler = asyncHandler(async (request, response) => {
    const sponsor = await this.sponsorService.getSponsorById(String(request.params.id), Boolean(request.user));
    sendSuccess(response, sponsor, "Sponsor fetched");
  });

  createSponsor: RequestHandler = asyncHandler(async (request, response) => {
    const data = sponsorCreateSchema.parse(request.body);
    const sponsor = await this.sponsorService.createSponsor(data);
    sendSuccess(response, sponsor, "Sponsor created", 201);
  });

  updateSponsor: RequestHandler = asyncHandler(async (request, response) => {
    const data = sponsorUpdateSchema.parse(request.body);
    const sponsor = await this.sponsorService.updateSponsor(String(request.params.id), data);
    sendSuccess(response, sponsor, "Sponsor updated");
  });

  deleteSponsor: RequestHandler = asyncHandler(async (request, response) => {
    await this.sponsorService.deleteSponsor(String(request.params.id));
    sendSuccess(response, null, "Sponsor deleted");
  });
}
