import type { QueryFilter } from "mongoose";
import { SponsorModel, type SponsorRecord } from "./sponsor.model.js";
import type { ISponsorRepository, SponsorCreateData, SponsorEntity, SponsorListFilter, SponsorListResult, SponsorUpdateData } from "./sponsor.types.js";
export class SponsorRepository implements ISponsorRepository {
  async findSponsors(filter: SponsorListFilter, page: number, limit: number, includePrivateFields: boolean): Promise<SponsorListResult> {
    const mongoFilter: QueryFilter<SponsorRecord> = filter;
    let query = SponsorModel.find(mongoFilter).sort({ name: 1 }).skip((page - 1) * limit).limit(limit);
    if (includePrivateFields) query = query.select("+contactPerson +contactMobile +notes");
    const [items, total] = await Promise.all([query.lean<SponsorEntity[]>().exec(), SponsorModel.countDocuments(mongoFilter).exec()]);
    return { items, total };
  }
  async findSponsorById(sponsorId: string, includePrivateFields: boolean): Promise<SponsorEntity | null> {
    let query = SponsorModel.findById(sponsorId);
    if (includePrivateFields) query = query.select("+contactPerson +contactMobile +notes");
    return query.lean<SponsorEntity>().exec();
  }
  async createSponsor(data: SponsorCreateData): Promise<SponsorEntity> {
    const sponsor = await SponsorModel.create(data);
    const persisted = await this.findSponsorById(String(sponsor._id), true);
    if (!persisted) throw new Error("Created sponsor could not be retrieved");
    return persisted;
  }
  async updateSponsor(sponsorId: string, data: SponsorUpdateData, includePrivateFields: boolean): Promise<SponsorEntity | null> {
    let query = SponsorModel.findByIdAndUpdate(sponsorId, { $set: data }, { new: true, runValidators: true });
    if (includePrivateFields) query = query.select("+contactPerson +contactMobile +notes");
    return query.lean<SponsorEntity>().exec();
  }
  async deleteSponsor(sponsorId: string): Promise<boolean> {
    return (await SponsorModel.findByIdAndDelete(sponsorId).select("_id").lean().exec()) !== null;
  }
}
