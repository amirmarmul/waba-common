import { Container } from '@/core/infrastructure/Container';
import { Cache } from '@/core/domain/cache/Cache';

export async function cache<T>(key: string, callback: Function, ttl: number = 30) {
  const cache = Container.get<Cache>('cacheService');

  const value = await cache.get(key);
  if (value) {
    return value;
  }

  return callback().then(async (data: T) => {
    await cache.set(key, data, ttl);
    return data;
  });
}
