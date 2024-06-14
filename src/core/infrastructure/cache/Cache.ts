import Container from 'typedi';
import { Repo } from '@/core/infrastructure/cache/Repo';
import { NullStore } from '@/core/infrastructure/cache/stores/NullStore';
import { ArrayStore } from '@/core/infrastructure/cache/stores/ArrayStore';
import { RedisStore } from '@/core/infrastructure/cache/stores/RedisStore';
import { Redis } from 'ioredis';

type StoreConfig = {
  driver: 'null' | 'array' | 'file' | 'redis';
}

type FlexibleStoreConfig = StoreConfig & {
  [key: string]: any
};

export type CacheConfig = {
  store: string;
  stores: {
    [key: string]: FlexibleStoreConfig;
  };
  prefix: string;
}

export class Cache {
  protected strategy: Repo;
  protected strategies: { [key: string]: any } = {};
  protected readonly config: CacheConfig;

  constructor(config: CacheConfig) {
    this.config = config;
    this.driver(config.store);
  }

  driver(name: string) {
    if (!(name in this.strategies)) {
      this.strategies[name] = this.resolve(name);
    }

    return this.strategy = this.strategies[name];
  }

  protected resolve(name: string) {
    const config = this.getConfig(name);

    if (!config) {
      throw new Error(`Cache store [${name}] is not defined.`);
    }

    const driverMethod = config.driver + 'Driver';

    if ((this as any)[driverMethod]) {
      return (this as any)[driverMethod](config);
    }

    throw new Error(`Cache driver [${config.driver}] is not supported.`);
  }

  protected getConfig(name: string) {
    if (name && name !== 'null') {
      return this.config.stores[name];
    }

    return { driver: 'null' };
  }

  protected getPrefix(config: CacheConfig) {
    return config.prefix;
  }

  protected nullDriver(config: CacheConfig) {
    return new Repo(new NullStore());
  }

  protected arrayDriver(config: CacheConfig) {
    return new Repo(new ArrayStore());
  }

  protected redisDriver(config: CacheConfig) {
    const redis = Container.get<Redis>(Redis);
    const prefix = this.getPrefix(config);

    return new Repo(
      new RedisStore(redis, prefix)
    );
  }

  /**
   * CacheContract
   */
  async has(key: string): Promise<boolean> {
    return await this.strategy.has(key);
  }

  async missing(key: string): Promise<boolean> {
    return await this.strategy.missing(key);
  }

  async get<T>(key: string, _default?: any): Promise<T | null> {
    return await this.strategy.get(key, _default);
  }

  async pull<T>(key: string, _default?: any): Promise<T | null> {
    return await this.strategy.pull(key, _default);
  }

  async put(key: string, value: any, ttl?: number): Promise<boolean> {
    return await this.strategy.put(key, value, ttl);
  }

  async add(key: string, value: any, ttl?: number): Promise<boolean> {
    return await this.strategy.add(key, value, ttl);
  }

  async forever(key: string, value: any): Promise<boolean> {
    return await this.strategy.forever(key, value);
  }

  async remember<T>(key: string, callback: Function, ttl?: number): Promise<T> {
    return await this.strategy.remember(key, callback, ttl);
  }

  async rememberForever<T>(key: string, callback: Function): Promise<T> {
    return await this.strategy.rememberForever(key, callback);
  }

  async forget(key: string): Promise<boolean> {
    return await this.strategy.forget(key);
  }
}
