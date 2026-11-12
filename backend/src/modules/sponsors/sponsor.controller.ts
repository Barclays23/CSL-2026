import type { Request, Response, NextFunction } from "express";
import { ApiResponse } from "../../shared/responses/apiResponse.utils.js";
import { HTTP_STATUS } from "../../shared/constants/http-status.constants.js";
import { SPONSOR_MESSAGES } from "../../shared/constants/messages.constants.js";
import type { PaginatedResult } from "../../shared/types/common.types.js";
import type { ISponsorController, ISponsorService, SponsorResponseDTO } from "./sponsor.types.js";
import { getSponsorsQuerySchema, sponsorCreateSchema, sponsorUpdateSchema, type SponsorCreateDTO, type SponsorUpdateDTO, type GetSponsorsQueryDTO } from "./sponsor.dto.js";

export class SponsorController implements ISponsorController {
  constructor(private readonly _sponsorService: ISponsorService) {}

  async getSponsors(request: Request, response: Response, next: NextFunction): Promise<void> {
    try {
      const query: GetSponsorsQueryDTO = getSponsorsQuerySchema.parse(request.query);
      const result: PaginatedResult<SponsorResponseDTO> = await this._sponsorService.getSponsors(query, Boolean(request.user));
      response.status(HTTP_STATUS.OK).json(ApiResponse.success<SponsorResponseDTO[]>(SPONSOR_MESSAGES.SPONSORS_FETCHED, result.items, result.pagination));
    } catch (error: unknown) { next(error); }
  }

  async getSponsorById(request: Request<{ id: string }>, response: Response, next: NextFunction): Promise<void> {
    try {
      const sponsorId: string = request.params.id;
      const sponsor: SponsorResponseDTO = await this._sponsorService.getSponsorById(sponsorId, Boolean(request.user));
      response.status(HTTP_STATUS.OK).json(ApiResponse.success<SponsorResponseDTO>(SPONSOR_MESSAGES.SPONSOR_FETCHED, sponsor));
    } catch (error: unknown) { next(error); }
  }

  async createSponsor(request: Request, response: Response, next: NextFunction): Promise<void> {
    try {
      const input: SponsorCreateDTO = sponsorCreateSchema.parse(request.body);
      const sponsor = await this._sponsorService.createSponsor(input);
      response.status(HTTP_STATUS.CREATED).json(ApiResponse.success(SPONSOR_MESSAGES.SPONSOR_CREATED, sponsor));
    } catch (error: unknown) { next(error); }
  }

  async updateSponsor(request: Request<{ id: string }>, response: Response, next: NextFunction): Promise<void> {
    try {
      const sponsorId: string = request.params.id;
      const input: SponsorUpdateDTO = sponsorUpdateSchema.parse(request.body);
      const sponsor = await this._sponsorService.updateSponsor(sponsorId, input);
      response.status(HTTP_STATUS.OK).json(ApiResponse.success(SPONSOR_MESSAGES.SPONSOR_UPDATED, sponsor));
    } catch (error: unknown) { next(error); }
  }

  async deleteSponsor(request: Request<{ id: string }>, response: Response, next: NextFunction): Promise<void> {
    try {
      const sponsorId: string = request.params.id;
      await this._sponsorService.deleteSponsor(sponsorId);
      response.status(HTTP_STATUS.OK).json(ApiResponse.success<null>(SPONSOR_MESSAGES.SPONSOR_DELETED, null));
    } catch (error: unknown) { next(error); }
  }
}
