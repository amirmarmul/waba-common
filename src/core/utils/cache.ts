import { Container } from '@/core/infrastructure/Container';
import { Cache } from '@/core/domain/cache/Cache';

export function cache<T>(key: string, callback: Function, ttl: number = 30) {
  const cache = Container.get<Cache>('cacheService');

  const value = cache.get(key);
  if (value) {
    return value;
  }

  return callback().then((data: T) => {
    cache.set(key, data, ttl);
    return data;
  });
}
