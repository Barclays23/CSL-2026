import type {
  FilterQuery,
  HydratedDocument,
  Model,
  PipelineStage,
  SortOrder,
  UpdateQuery,
} from "mongoose";

/**
 * Generic persistence base.
 * Feature repositories should expose descriptive, domain-specific methods
 * and delegate common MongoDB operations to this class.
 */
export abstract class CrudRepository<TEntity extends object> {
  protected constructor(protected readonly model: Model<TEntity>) {}

  async list(
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

  async findById(id: string): Promise<HydratedDocument<TEntity> | null> {
    return this.model.findById(id).exec();
  }

  async findOne(filter: FilterQuery<TEntity>): Promise<HydratedDocument<TEntity> | null> {
    return this.model.findOne(filter).exec();
  }

  async count(filter: FilterQuery<TEntity> = {}): Promise<number> {
    return this.model.countDocuments(filter).exec();
  }

  async create(data: Partial<TEntity>): Promise<HydratedDocument<TEntity>> {
    return this.model.create(data);
  }

  async update(id: string, data: UpdateQuery<TEntity>): Promise<HydratedDocument<TEntity> | null> {
    return this.model.findByIdAndUpdate(id, { $set: data }, {
      new: true,
      runValidators: true,
    }).exec();
  }

  async remove(id: string): Promise<HydratedDocument<TEntity> | null> {
    return this.model.findByIdAndDelete(id).exec();
  }

  async aggregate<TResult>(pipeline: PipelineStage[]): Promise<TResult[]> {
    return this.model.aggregate<TResult>(pipeline).exec();
  }

  protected get nativeModel(): Model<TEntity> {
    return this.model;
  }
}
