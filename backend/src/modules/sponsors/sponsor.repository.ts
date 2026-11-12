import type { FilterQuery } from "mongoose";
import { SponsorModel } from "./sponsor.model.js";
import type { SponsorRecord } from "./sponsor.model.js";
import type { SponsorRecord } from "./sponsor.model.js";
import type { ISponsorRepository, SponsorCreateData, SponsorEntity, SponsorListFilter, SponsorListResult, SponsorUpdateData } from "./sponsor.types.js";

export class SponsorRepository implements ISponsorRepository {
  async findSponsors(filter: SponsorListFilter, page: number, limit: number, includePrivateFields: boolean): Promise<SponsorListResult> {
    const mongoFilter: FilterQuery<SponsorRecord> = filter;
    let sponsorQuery = SponsorModel.find(mongoFilter).sort({ name: 1 }).skip((page - 1) * limit).limit(limit);
    if (includePrivateFields) sponsorQuery = sponsorQuery.select("+contactPerson +contactMobile +notes");
    const [items, total] = await Promise.all([
      sponsorQuery.lean<SponsorEntity[]>().exec(),
      SponsorModel.countDocuments(mongoFilter).exec(),
    ]);
    return { items, total };
  }

  async findSponsorById(sponsorId: string, includePrivateFields: boolean): Promise<SponsorEntity | null> {
    let sponsorQuery = SponsorModel.findById(sponsorId);
    if (includePrivateFields) sponsorQuery = sponsorQuery.select("+contactPerson +contactMobile +notes");
    return sponsorQuery.lean<SponsorEntity>().exec();
  }

  async createSponsor(data: SponsorCreateData): Promise<SponsorEntity> {
    const sponsor = await SponsorModel.create(data);
    const persistedSponsor = await this.findSponsorById(String(sponsor._id), true);
    if (!persistedSponsor) throw new Error("Created sponsor could not be retrieved");
    return persistedSponsor;
  }

  async updateSponsor(sponsorId: string, data: SponsorUpdateData, includePrivateFields: boolean): Promise<SponsorEntity | null> {
    let sponsorQuery = SponsorModel.findByIdAndUpdate(sponsorId, { $set: data }, { new: true, runValidators: true });
    if (includePrivateFields) sponsorQuery = sponsorQuery.select("+contactPerson +contactMobile +notes");
    return sponsorQuery.lean<SponsorEntity>().exec();
  }

  async deleteSponsor(sponsorId: string): Promise<boolean> {
    const deletedSponsor = await SponsorModel.findByIdAndDelete(sponsorId).select("_id").lean().exec();
    return deletedSponsor !== null;
  }
}
