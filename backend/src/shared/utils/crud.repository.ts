import type {
  FilterQuery,
  HydratedDocument,
  Model,
  PipelineStage,
  SortOrder,
  UpdateQuery,
} from "mongoose";

/**
 * Typed base repository.
 * Feature repositories expose domain-specific methods and delegate common
 * persistence operations to this class.
 */
export abstract class CrudRepository<TEntity extends object> {
  protected constructor(protected readonly model: Model<TEntity>) {}

  async findAll(
    filter: FilterQuery<TEntity> = {},
    page = 1,
    limit = 50,
    sort: Record<string, SortOrder> = { createdAt: -1 },
  ): Promise<{ items: HydratedDocument<TEntity>[]; total: number }> {
    const [items, total] = await Promise.all([
      this.model
        .find(filter)
        .sort(sort)
        .skip((page - 1) * limit)
        .limit(limit)
        .exec(),
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

  async countDocuments(filter: FilterQuery<TEntity> = {}): Promise<number> {
    return this.model.countDocuments(filter).exec();
  }

  async createRecord(data: Partial<TEntity>): Promise<HydratedDocument<TEntity>> {
    return this.model.create(data);
  }

  async updateById(
    id: string,
    update: UpdateQuery<TEntity>,
  ): Promise<HydratedDocument<TEntity> | null> {
    return this.model.findByIdAndUpdate(id, update, {
      new: true,
      runValidators: true,
    }).exec();
  }

  async deleteById(id: string): Promise<HydratedDocument<TEntity> | null> {
    return this.model.findByIdAndDelete(id).exec();
  }

  async aggregate<TResult>(pipeline: PipelineStage[]): Promise<TResult[]> {
    return this.model.aggregate<TResult>(pipeline).exec();
  }
}
