import type { FilterQuery, PipelineStage, SortOrder, Types } from "mongoose";
export interface EntityWithId { _id: Types.ObjectId; }
export interface PaginatedRepositoryResult<TEntity> { items: TEntity[]; total: number; }
export interface ListOptions { page: number; limit: number; sort?: Record<string, SortOrder>; }
export interface IReadRepository<TEntity extends EntityWithId, TFilter = FilterQuery<TEntity>> {
  findById(id: string): Promise<TEntity | null>;
  findOne(filter: TFilter): Promise<TEntity | null>;
  findMany(filter: TFilter, options: ListOptions): Promise<PaginatedRepositoryResult<TEntity>>;
  count(filter?: TFilter): Promise<number>;
}
export interface IWriteRepository<TEntity extends EntityWithId, TCreate, TUpdate> {
  create(data: TCreate): Promise<TEntity>;
  update(id: string, data: TUpdate): Promise<TEntity | null>;
  delete(id: string): Promise<boolean>;
}
export interface IAggregateRepository<TResult> { aggregate(pipeline: PipelineStage[]): Promise<TResult[]>; }
