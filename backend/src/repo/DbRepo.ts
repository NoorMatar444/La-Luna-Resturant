import {
  Model,
  ProjectionType,
  QueryFilter,
  QueryOptions,
  UpdateQuery,
} from 'mongoose';

export abstract class DbRepo<T> {
  constructor(private model: Model<T>) {}
  async findById({ id }: { id?: any | string }) {
    return this.model.findById(id);
  }
  async findOne({
    filter,
    projection,
    options,
  }: {
    filter?: QueryFilter<T>;
    projection?: ProjectionType<T>;
    options?: QueryOptions<T>;
  }) {
    return this.model.findOne(filter, projection, options);
  }
  async create({ data }: { data: any }) {
    return this.model.create(data);
  }
  async findOneAndUpdate({
    filter,
    update,
    options,
  }: {
    filter?: QueryFilter<T>;
    update?: UpdateQuery<T>;
    options?: QueryOptions<T>;
  }) {
    return this.model.findOneAndUpdate(filter, update, options);
  }
  async findAll({
    filter,
    projection,
    options,
  }: {
    filter?: QueryFilter<T>;
    projection?: ProjectionType<T> | null | undefined;
    options?: QueryOptions<T>;
  }) {
    return this.model.find(filter, projection, options);
  }
  async findOneAndDelete({
    filter,
    options,
  }: {
    filter?: QueryFilter<T>;
    options?: QueryOptions<T>;
  }) {
    return this.model.findOneAndDelete(filter, options);
  }
}
