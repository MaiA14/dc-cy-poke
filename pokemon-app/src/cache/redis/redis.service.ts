import { Injectable } from '@nestjs/common';
import { Cache } from 'cache-manager';
import { redisStore } from 'cache-manager-redis-yet';
import { ICacheService } from 'src/types/cache.interface';

@Injectable()
export class RedisService implements ICacheService {
  private cache: Cache;

  constructor(private cacheOptions: any) {
    this.initializeCache(cacheOptions);
  }

  private async initializeCache(cacheOptions: any) {
    this.cache = await redisStore(cacheOptions) as unknown as Cache; // Cast to `Cache` to avoid TypeScript type mismatch
  }

  async get(key: string) {
    const value = await this.cache.get(key);
    return value;
  }

  async set(key: string, value: unknown, ttl?: number) {
    const valueToSave = (typeof value == 'string' ? value : JSON.stringify(value));
    if (ttl) {  
      await this.cache.set(key, valueToSave, ttl);
    } else {
      await this.cache.set(key, valueToSave);
    }
  }

  async del(key: string) {
    await this.cache.del(key);
  }

  async reset() {
    await this.cache.reset();
  }
}