import { AppError } from "../../shared/errors/appError.js";
import type { PaginatedResult } from "../../shared/types/common.types.js";
import type { ISponsorRepository, ISponsorService } from "./sponsor.interfaces.js";
import type { AdminSponsorDTO, PublicSponsorDTO, SponsorEntity, SponsorListFilter, SponsorQuery, SponsorResponseDTO, SponsorCreateData, SponsorUpdateData } from "./sponsor.types.js";

export class SponsorService implements ISponsorService {
  constructor(private readonly _sponsorRepository: ISponsorRepository) {}

  async getSponsors(query: SponsorQuery, isAdmin: boolean): Promise<PaginatedResult<SponsorResponseDTO>> {
    const page = query.page;
    const limit = query.limit;
    const filter: SponsorListFilter = {};
    if (isAdmin && query.status) filter.status = query.status;
    else if (!isAdmin) filter.status = "active";
    if (query.search) filter.name = { $regex: query.search, $options: "i" };

    const result = await this._sponsorRepository.findSponsors(filter, page, limit, isAdmin);
    return {
      items: result.items.map((sponsor) => this.mapSponsorToResponseDTO(sponsor, isAdmin)),
      pagination: {
        page,
        limit,
        total: result.total,
        totalPages: Math.ceil(result.total / limit),
      },
    };
  }

  async getSponsorById(sponsorId: string, isAdmin: boolean): Promise<SponsorResponseDTO> {
    const sponsor = await this._sponsorRepository.findSponsorById(sponsorId, isAdmin);
    if (!sponsor || (!isAdmin && sponsor.status !== "active")) {
      throw new AppError("Sponsor not found", 404, "NOT_FOUND");
    }
    return this.mapSponsorToResponseDTO(sponsor, isAdmin);
  }

  async createSponsor(data: SponsorCreateData): Promise<AdminSponsorDTO> {
    const sponsor = await this._sponsorRepository.createSponsor(data);
    return this.mapSponsorToAdminDTO(sponsor);
  }

  async updateSponsor(sponsorId: string, data: SponsorUpdateData): Promise<AdminSponsorDTO> {
    const sponsor = await this._sponsorRepository.updateSponsor(sponsorId, data, true);
    if (!sponsor) throw new AppError("Sponsor not found", 404, "NOT_FOUND");
    return this.mapSponsorToAdminDTO(sponsor);
  }

  async deleteSponsor(sponsorId: string): Promise<void> {
    const deleted = await this._sponsorRepository.deleteSponsor(sponsorId);
    if (!deleted) throw new AppError("Sponsor not found", 404, "NOT_FOUND");
  }

  private mapSponsorToResponseDTO(sponsor: SponsorEntity, isAdmin: boolean): SponsorResponseDTO {
    return isAdmin ? this.mapSponsorToAdminDTO(sponsor) : this.mapSponsorToPublicDTO(sponsor);
  }

  private mapSponsorToPublicDTO(sponsor: SponsorEntity): PublicSponsorDTO {
    return {
      _id: String(sponsor._id),
      name: sponsor.name,
      logo: sponsor.logo,
      tier: sponsor.tier,
      website: sponsor.website,
      status: sponsor.status,
    };
  }

  private mapSponsorToAdminDTO(sponsor: SponsorEntity): AdminSponsorDTO {
    return {
      ...this.mapSponsorToPublicDTO(sponsor),
      contactPerson: sponsor.contactPerson,
      contactMobile: sponsor.contactMobile,
      notes: sponsor.notes,
    };
  }
}
