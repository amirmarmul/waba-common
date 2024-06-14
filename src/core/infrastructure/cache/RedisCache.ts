import { Cache as CacheContract } from '@/core/domain/cache/Cache';
import { Redis } from 'ioredis';

const DEFAULT_NAMESPACE = "waba";
const DEFAULT_CACHE_TIME_IN_SECONDS = 30;
const EXPIRY_MODE = "EX";

/**
 * @deprecated
 */
export class RedisCache implements CacheContract {
  protected readonly TTL: number;
  protected readonly redis: Redis;
  private readonly namespace: string;

  constructor() {
    this.redis = new Redis(process.env.REDIS_URL!);
    this.TTL = DEFAULT_CACHE_TIME_IN_SECONDS;
    this.namespace = DEFAULT_NAMESPACE;
  }

  async get<T>(key: string): Promise<T | null> {
    key = this.getCacheKey(key);
    try {
      const cached = await this.redis.get(key);
      if (cached) {
        return JSON.parse(cached);
      }
    } catch (error) {
      await this.redis.del(key);
    }
    return null;
  }

  async set(key: string, data: Record<string, unknown>, ttl: number = this.TTL): Promise<void> {
    if (ttl === 0) {
      return;
    }

    await this.redis.set(
      this.getCacheKey(key),
      JSON.stringify(data),
      EXPIRY_MODE,
      ttl
    );
  }

  async invalidate(key: string): Promise<void> {
    const keys = await this.redis.keys(this.getCacheKey(key));
    const pipeline = this.redis.pipeline();

    keys.forEach(function (key) {
      pipeline.del(key);
    });

    await pipeline.exec();
  }

  private getCacheKey(key: string): string {
    return this.namespace ? `${this.namespace}:${key}` : key;
  }
}
