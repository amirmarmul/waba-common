import Container from 'typedi';
import { Redis } from 'ioredis';
import { Repo } from '@/core/infrastructure/cache/Repo';
import { NullStore } from '@/core/infrastructure/cache/stores/NullStore';
import { ArrayStore } from '@/core/infrastructure/cache/stores/ArrayStore';
import { RedisStore } from '@/core/infrastructure/cache/stores/RedisStore';
import { FileStore } from '@/core/infrastructure/cache/stores/FileStore';

type CacheDriver = 'null' | 'array' | 'file' | 'redis';

type StoreConfig = {
  driver: CacheDriver;
  [key: string]: any;
}

export type CacheConfig = {
  store: string;
  stores: {
    [key: string]: StoreConfig;
  };
  prefix: string;
}

export class Cache {
  protected stores: { [key: string]: Repo } = {};
  protected readonly config: CacheConfig;

  constructor(config: CacheConfig) {
    this.config = config;
  }

  driver(driver?: CacheDriver) {
    return this.store(driver);
  }

  protected store(name?: string) {
    name = name || this.getDefaultDriver();

    if (!(name in this.stores)) {
      this.stores[name] = this.resolve(name);
    }

    return this.stores[name];
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

  protected getPrefix() {
    return this.config.prefix;
  }

  protected getDefaultDriver() {
    return this.config.store;
  }

  protected nullDriver(config: StoreConfig) {
    return new Repo(new NullStore());
  }

  protected arrayDriver(config: StoreConfig) {
    return new Repo(new ArrayStore());
  }

  protected fileDriver(config: StoreConfig) {
    const path = config.path || 'storage/cache/data';

    return new Repo(
      new FileStore(path)
    );
  }

  protected redisDriver(config: StoreConfig) {
    const redis = new Redis(config.redisUrl);
    const prefix = this.getPrefix();

    return new Repo(
      new RedisStore(redis, prefix)
    );
  }

  /**
   * CacheContract
   */
  async has(key: string): Promise<boolean> {
    return await this.store().has(key);
  }

  async missing(key: string): Promise<boolean> {
    return await this.store().missing(key);
  }

  async get<T>(key: string, _default?: any): Promise<T | null> {
    return await this.store().get(key, _default);
  }

  async pull<T>(key: string, _default?: any): Promise<T | null> {
    return await this.store().pull(key, _default);
  }

  async put(key: string, value: any, ttl?: number): Promise<boolean> {
    return await this.store().put(key, value, ttl);
  }

  async add(key: string, value: any, ttl?: number): Promise<boolean> {
    return await this.store().add(key, value, ttl);
  }

  async forever(key: string, value: any): Promise<boolean> {
    return await this.store().forever(key, value);
  }

  async remember<T>(key: string, callback: Function, ttl?: number): Promise<T> {
    return await this.store().remember(key, callback, ttl);
  }

  async rememberForever<T>(key: string, callback: Function): Promise<T> {
    return await this.store().rememberForever(key, callback);
  }

  async forget(key: string): Promise<boolean> {
    return await this.store().forget(key);
  }

  async flush(): Promise<boolean> {
    return await this.store().flush();
  }
}
