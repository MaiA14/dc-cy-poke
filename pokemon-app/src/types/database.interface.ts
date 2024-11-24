import { FindOptionsWhere } from "typeorm";

export interface IDatabaseService {
  create<T>(entityClass: new () => T, entity: Partial<T>): Promise<Partial<T>>;
  findWithConditions<T>(entityClass: new () => T, conditions: FindOptionsWhere<T> | FindOptionsWhere<T>[]): Promise<T[]>;
  findOne<T>(entityClass: new () => T, id: number): Promise<T | null>;
  findAll<T>(entityClass: new () => T, take: number, skip: number): Promise<T[]>;
  update<T>(entityClass: new () => T, id: number, updateData: Partial<T>): Promise<T>;
  delete<T>(entityClass: new () => T, id: number): Promise<void>;
}