import { Injectable } from '@nestjs/common';
import { DataSource, FindOptionsWhere, Repository } from 'typeorm';

@Injectable()
export class PostgresService {
  constructor(private readonly dataSource: DataSource) { 

  }

  protected getRepository<T>(entityCls: new () => T): Repository<T> {
    const repository = this.dataSource.getRepository(entityCls);
    if (!repository) {
      throw new Error(`Repository for ${entityCls.name} not found`);
    }
    return repository;
  }

  async create<T>(entityClass: new () => T, entity: T): Promise<T> {
    const repository = this.getRepository(entityClass);
    const createdEntity = repository.create(entity);
    return await repository.save(createdEntity);
  }

  async update<T>(entityClass: new () => T, id: number, updateData: Partial<T>): Promise<T> {
    const repository = this.getRepository(entityClass);
    const entities = await repository.find({
      where: { id } as unknown as FindOptionsWhere<T>,
    });

    if (!entities) {
      throw new Error('Entity not found');
    }

    const entity = entities[0];

    Object.assign(entity, updateData);
    return repository.save(entity);
  }

  async delete<T>(entityClass: new () => T, id: number): Promise<void> {
    const repository = this.getRepository(entityClass);
    const entity = await repository.findOne({
      where: { id } as unknown as FindOptionsWhere<T>,
    });

    if (!entity) {
      throw new Error('Entity not found');
    }

    await repository.remove(entity);
  }

  async findOne<T>(entityClass: new () => T, id: number): Promise<T | null> {
    return this.getRepository(entityClass).findOne({
      where: { id } as unknown as FindOptionsWhere<T>,
    });
  }

  async findAll<T>(entityClass: new () => T, take: number, skip: number): Promise<T[]> {
    return this.getRepository(entityClass).find({
      take,
      skip,
    });
  }

  async findWithConditions<T>(entityClass: new () => T, conditions: FindOptionsWhere<T> | FindOptionsWhere<T>[]): Promise<T[]> {
    return this.getRepository(entityClass).find({
      where: conditions,
    });
  }
}