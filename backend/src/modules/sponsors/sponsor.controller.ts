import type { Request, Response, NextFunction } from "express";
import { ApiResponse } from "../../utils/apiResponse.utils.js";
import { HTTP_STATUS } from "../../shared/constants/http-status.constants.js";
import { getRequiredRouteParam } from "../../shared/utils/routeParams.js";
import { SPONSOR_MESSAGES } from "../../shared/constants/messages.constants.js";
import type { PaginatedResult } from "../../shared/types/common.types.js";
import type { ISponsorController, ISponsorService } from "./sponsor.interfaces.js";
import type { SponsorResponseDTO, AdminSponsorDTO } from "./sponsor.types.js";
import {
  getSponsorsQuerySchema,
  sponsorCreateSchema,
  sponsorUpdateSchema,
} from "./sponsor.schema.js";
import type {
  SponsorCreateDTO,
  SponsorUpdateDTO,
  GetSponsorsQueryDTO,
} from "./sponsor.dto.js";





export class SponsorController implements ISponsorController {
  constructor(
    private readonly _sponsorService: ISponsorService
  ) {}

  getSponsors = async (
    request: Request,
    response: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const query: GetSponsorsQueryDTO = getSponsorsQuerySchema.parse(request.query);
      const result: PaginatedResult<SponsorResponseDTO> =
        await this._sponsorService.getSponsors(query, Boolean(request.user));
      response
        .status(HTTP_STATUS.OK)
        .json(
          ApiResponse.success<SponsorResponseDTO[]>(
            SPONSOR_MESSAGES.SPONSORS_FETCHED,
            result.items,
            result.pagination,
          ),
        );
    } catch (error: unknown) {
      next(error);
    }
  };

  getSponsorById = async (
    request: Request,
    response: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const sponsorId: string = getRequiredRouteParam(request.params.id, "id");
      const sponsor: SponsorResponseDTO =
        await this._sponsorService.getSponsorById(sponsorId, Boolean(request.user));
      response
        .status(HTTP_STATUS.OK)
        .json(ApiResponse.success<SponsorResponseDTO>(SPONSOR_MESSAGES.SPONSOR_FETCHED, sponsor));
    } catch (error: unknown) {
      next(error);
    }
  };

  createSponsor = async (
    request: Request,
    response: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const input: SponsorCreateDTO = sponsorCreateSchema.parse(request.body);
      const sponsor: AdminSponsorDTO = await this._sponsorService.createSponsor(input);
      response
        .status(HTTP_STATUS.CREATED)
        .json(ApiResponse.success(SPONSOR_MESSAGES.SPONSOR_CREATED, sponsor));
    } catch (error: unknown) {
      next(error);
    }
  };

  updateSponsor = async (
    request: Request,
    response: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const sponsorId: string = getRequiredRouteParam(request.params.id, "id");
      const input: SponsorUpdateDTO = sponsorUpdateSchema.parse(request.body);
      const sponsor: AdminSponsorDTO = await this._sponsorService.updateSponsor(sponsorId, input);
      response
        .status(HTTP_STATUS.OK)
        .json(ApiResponse.success(SPONSOR_MESSAGES.SPONSOR_UPDATED, sponsor));
    } catch (error: unknown) {
      next(error);
    }
  };

  deleteSponsor = async (
    request: Request,
    response: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const sponsorId: string = getRequiredRouteParam(request.params.id, "id");
      await this._sponsorService.deleteSponsor(sponsorId);
      response
        .status(HTTP_STATUS.OK)
        .json(ApiResponse.success<null>(SPONSOR_MESSAGES.SPONSOR_DELETED, null));
    } catch (error: unknown) {
      next(error);
    }
  };
}