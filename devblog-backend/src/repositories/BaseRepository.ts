import { Model, Document, FilterQuery, UpdateQuery } from "mongoose";

export class BaseRepository<T extends Document> {
  constructor(public readonly model: Model<T>) {}

  async create(data: Partial<T>): Promise<T> {
    return this.model.create(data);
  }

  async findById(id: string): Promise<T | null> {
    return this.model.findById(id);
  }

  async findOne(query: FilterQuery<T>): Promise<T | null> {
    return this.model.findOne(query);
  }

  async find(
    query: FilterQuery<T>,
    sort: any = { createdAt: -1 },
    skip = 0,
    limit = 10,
    select?: string,
  ): Promise<T[]> {
    const q = this.model.find(query).sort(sort).skip(skip).limit(limit);
    if (select) {
      q.select(select);
    }
    return q.exec() as Promise<T[]>;
  }

  async count(query: FilterQuery<T>): Promise<number> {
    return this.model.countDocuments(query);
  }

  async update(id: string, data: UpdateQuery<T>): Promise<T | null> {
    return this.model.findByIdAndUpdate(id, data, { new: true });
  }

  async delete(id: string): Promise<T | null> {
    return this.model.findByIdAndDelete(id);
  }
}
