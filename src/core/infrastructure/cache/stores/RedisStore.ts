import { Store } from '@/core/domain/cache/Store';
import { Redis } from 'ioredis';

export class RedisStore implements Store {
  protected readonly redis: Redis;
  protected readonly prefix: string;

  constructor(redis: Redis, prefix: string = '') {
    this.redis = redis;
    this.prefix = prefix;
  }

  async get<T>(key: string): Promise<T | null> {
    try {
      const value = await this.redis.get(key);
      if (value) {
        return JSON.parse(value);
      }
    } catch (error) {
      await this.forget(key);
    }
    return null;
  }

  async put(key: string, value: unknown, ttl: number): Promise<boolean> {
    return !! await this.redis.set(key, JSON.stringify(value), 'EX', ttl);
  }

  async forever(key: string, value: unknown): Promise<boolean> {
    return !! await this.redis.set(key, JSON.stringify(value));
  }

  async forget(key: string): Promise<boolean> {
    const keys = await this.redis.keys(key);
    const pipeline = this.redis.pipeline();

    keys.forEach((key) => {
      pipeline.del(key);
    });

    return !! await pipeline.exec();
  }

  async flush(): Promise<boolean> {
    return await this.forget('*');
  }

  getPrefix(): string {
    return this.prefix;
  }
}
