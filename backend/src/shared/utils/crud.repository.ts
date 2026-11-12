import type {
  FilterQuery,
  HydratedDocument,
  Model,
  PipelineStage,
  SortOrder,
  UpdateQuery,
} from "mongoose";

/**
 * Typed persistence helpers for simple CRUD features.
 * Feature repositories should expose domain-specific method names and DTOs.
 */
export abstract class CrudRepository<TEntity extends object> {
  protected constructor(protected readonly model: Model<TEntity>) {}

  async findManyRecords(
    filter: FilterQuery<TEntity> = {},
    page = 1,
    limit = 50,
    sort: Record<string, SortOrder> = { createdAt: -1 },
  ): Promise<{ items: HydratedDocument<TEntity>[]; total: number }> {
    const [items, total] = await Promise.all([
      this.model.find(filter).sort(sort).skip((page - 1) * limit).limit(limit).exec(),
      this.model.countDocuments(filter).exec(),
    ]);
    return { items, total };
  }

  async findRecordById(id: string): Promise<HydratedDocument<TEntity> | null> {
    return this.model.findById(id).exec();
  }

  async findOneRecord(filter: FilterQuery<TEntity>): Promise<HydratedDocument<TEntity> | null> {
    return this.model.findOne(filter).exec();
  }

  async countRecords(filter: FilterQuery<TEntity> = {}): Promise<number> {
    return this.model.countDocuments(filter).exec();
  }

  async createRecord(data: Partial<TEntity>): Promise<HydratedDocument<TEntity>> {
    return this.model.create(data);
  }

  async updateRecordById(
    id: string,
    data: UpdateQuery<TEntity>,
  ): Promise<HydratedDocument<TEntity> | null> {
    return this.model.findByIdAndUpdate(id, { $set: data }, {
      new: true,
      runValidators: true,
    }).exec();
  }

  async deleteRecordById(id: string): Promise<HydratedDocument<TEntity> | null> {
    return this.model.findByIdAndDelete(id).exec();
  }

  async aggregateRecords<TResult>(pipeline: PipelineStage[]): Promise<TResult[]> {
    return this.model.aggregate<TResult>(pipeline).exec();
  }
}
