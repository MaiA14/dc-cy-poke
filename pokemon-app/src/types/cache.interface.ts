export interface ICacheService {
  get(key: string);
  set(key: string, value: unknown, ttl?: number);
  del(key: string);
  reset();
}