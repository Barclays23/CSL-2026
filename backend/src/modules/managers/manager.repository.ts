import { Types, type QueryFilter } from "mongoose";
import { ManagerModel, type ManagerRecord } from "./manager.model.js";
type ManagerWriteData = Omit<Partial<ManagerRecord>, "teamRef"> & { teamRef?: string | Types.ObjectId | null };
const toMongoManagerData = (data: ManagerWriteData): Partial<ManagerRecord> => ({
  ...data,
  ...(data.teamRef === undefined ? {} : { teamRef: data.teamRef === null ? null : new Types.ObjectId(String(data.teamRef)) }),
});
export interface ManagerListRecord extends Omit<ManagerRecord, "teamRef"> {
  _id: Types.ObjectId;
  teamRef: Types.ObjectId | { _id: Types.ObjectId; name: string; shortName: string | null; logo: { url: string; publicId: string } | null; groupName: string | null } | null;
}
export class ManagerRepository {
  async listManagers(filter: QueryFilter<ManagerRecord>, page: number, limit: number): Promise<{ items: ManagerListRecord[]; total: number }> {
    const [items, total] = await Promise.all([
      ManagerModel.find(filter).sort({ name: 1 }).skip((page - 1) * limit).limit(limit).populate({ path: "teamRef", select: "name shortName logo groupName" }).lean<ManagerListRecord[]>().exec(),
      ManagerModel.countDocuments(filter).exec(),
    ]);
    return { items, total };
  }
  async findManagerById(managerId: string): Promise<ManagerListRecord | null> {
    return ManagerModel.findById(managerId).populate({ path: "teamRef", select: "name shortName logo groupName" }).lean<ManagerListRecord>().exec();
  }
  async findById(managerId: string): Promise<(ManagerRecord & { _id: Types.ObjectId }) | null> {
    return ManagerModel.findById(managerId).lean().exec() as Promise<(ManagerRecord & { _id: Types.ObjectId }) | null>;
  }
  async findByMobile(mobile: string): Promise<(ManagerRecord & { _id: Types.ObjectId }) | null> {
    return ManagerModel.findOne({ mobile }).lean().exec() as Promise<(ManagerRecord & { _id: Types.ObjectId }) | null>;
  }
  async findByEmail(email: string): Promise<(ManagerRecord & { _id: Types.ObjectId }) | null> {
    return ManagerModel.findOne({ email }).lean().exec() as Promise<(ManagerRecord & { _id: Types.ObjectId }) | null>;
  }
  async createManager(data: ManagerWriteData): Promise<ManagerRecord & { _id: Types.ObjectId }> {
    const manager = await ManagerModel.create(toMongoManagerData(data)); return manager.toObject() as ManagerRecord & { _id: Types.ObjectId };
  }
  async updateManager(managerId: string, data: ManagerWriteData): Promise<(ManagerRecord & { _id: Types.ObjectId }) | null> {
    return ManagerModel.findByIdAndUpdate(managerId, { $set: toMongoManagerData(data) }, { new: true, runValidators: true }).lean().exec() as Promise<(ManagerRecord & { _id: Types.ObjectId }) | null>;
  }
  async deleteManager(managerId: string): Promise<boolean> {
    const deleted = await ManagerModel.findByIdAndDelete(managerId).select("_id").lean().exec(); return deleted !== null;
  }
}
