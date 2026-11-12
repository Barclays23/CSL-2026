import type { QueryFilter, PipelineStage, SortOrder, Types } from "mongoose";
export interface EntityWithId { _id: Types.ObjectId; }
export interface PaginatedRepositoryResult<TEntity> { items: TEntity[]; total: number; }
export interface ListOptions { page: number; limit: number; sort?: Record<string, SortOrder>; }
export interface IReadRepository<TEntity extends EntityWithId> {
  findById(id: string): Promise<TEntity | null>;
  findOne(filter: QueryFilter<TEntity>): Promise<TEntity | null>;
  findMany(filter: QueryFilter<TEntity>, options: ListOptions): Promise<PaginatedRepositoryResult<TEntity>>;
  count(filter?: QueryFilter<TEntity>): Promise<number>;
}
export interface IWriteRepository<TEntity extends EntityWithId, TCreate, TUpdate> {
  create(data: TCreate): Promise<TEntity>;
  update(id: string, data: TUpdate): Promise<TEntity | null>;
  delete(id: string): Promise<boolean>;
}
export interface IAggregateRepository<TResult> { aggregate(pipeline: PipelineStage[]): Promise<TResult[]>; }
