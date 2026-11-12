import type { QueryFilter, Model, PipelineStage, SortOrder } from "mongoose";
export type Row=Record<string,unknown>;
export class CrudRepository {
  private readonly model:Model<Row>;
  constructor(model:unknown){this.model=model as Model<Row>;}
  async list(filter:Row,page=1,limit=50,sort:Record<string,SortOrder>={createdAt:-1}):Promise<{items:Row[];total:number}>{
    const query=filter as QueryFilter<Row>;
    const [items,total]=await Promise.all([
      this.model.find(query).sort(sort).skip((page-1)*limit).limit(limit).lean().exec(),
      this.model.countDocuments(query).exec()
    ]);
    return {items:items as unknown as Row[],total};
  }
  async findById(id:string):Promise<Row|null>{return await this.model.findById(id).lean().exec() as unknown as Row|null;}
  async findOne(filter:Row):Promise<Row|null>{return await this.model.findOne(filter as QueryFilter<Row>).lean().exec() as unknown as Row|null;}
  async count(filter:Row={}):Promise<number>{return this.model.countDocuments(filter as QueryFilter<Row>).exec();}
  async create(data:Row):Promise<Row>{return await this.model.create(data) as unknown as Row;}
  async update(id:string,data:Row):Promise<Row|null>{return await this.model.findByIdAndUpdate(id,{$set:data},{new:true,runValidators:true}).lean().exec() as unknown as Row|null;}
  async remove(id:string):Promise<Row|null>{return await this.model.findByIdAndDelete(id).lean().exec() as unknown as Row|null;}
  async aggregate<T extends Row>(pipeline:PipelineStage[]):Promise<T[]>{return await this.model.aggregate<T>(pipeline).exec();}
  get native():Model<Row>{return this.model;}
}
