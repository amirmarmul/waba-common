import { Repo as Cache } from '@/core/domain/cache/Repo';
import { Store } from '@/core/domain/cache/Store';

export class Repo implements Cache {
  protected store: Store;
  protected ttl: number;

  constructor(store: Store) {
    this.store = store;
    this.ttl = 3600;
  }

  async has(key: string): Promise<boolean> {
    return !! await this.get(key);
  }

  async missing(key: string): Promise<boolean> {
    return ! await this.has(key);
  }

  async get<T>(key: string, _default?: any): Promise<T | null> {
    const value = await this.store.get(this.itemKey(key));

    return value || await this.value(_default);
  }

  async pull<T>(key: string, _default?: any): Promise<T | null> {
    const value = await this.get(key);

    if (value) {
      await this.forget(key);
    }

    return value || await this.value(_default);
  }

  async put(key: string, value: any, ttl: number = this.ttl): Promise<boolean> {
    const seconds = this.getSeconds(ttl);

    if (seconds <= 0) {
      return await this.forget(key);
    }

    const result = await this.store.put(this.itemKey(key), value, seconds);

    return result;
  }

  async add(key: string, value: any, ttl: number = this.ttl): Promise<boolean> {
    let seconds = undefined;

    if (!ttl) {
      seconds = this.getSeconds(ttl);

      if (seconds <= 0) {
        return false;
      }
    }

    if (await this.missing(key)) {
      return await this.put(key, value, seconds);
    }

    return false;
  }

  async forever(key: string, value: unknown): Promise<boolean> {
    const result = await this.store.forever(this.itemKey(key), value);

    return result;
  }

  async remember<T>(key: string, callback: Function, ttl: number = this.ttl): Promise<T> {
    let value = await this.get(key);

    if (value) {
      return value as T;
    }

    value = await this.value(callback);

    await this.put(key, value, ttl);

    return value as T;
  }

  async rememberForever<T>(key: string, callback: Function): Promise<T> {
    let value = await this.get(key);

    if (value) {
      return value as T;
    }

    value = await this.value(callback())

    await this.forever(key, value);

    return value as T;
  }

  async forget(key: string): Promise<boolean> {
    const result = await this.store.forget(this.itemKey(key));

    return result;
  }

  async flush(): Promise<boolean> {
    const result = await this.store.flush();

    return result;
  }

  getDefaultCacheTime(): number {
    return this.ttl;
  }

  setDefaultCacheTime(ttl: number): Repo {
    this.ttl = ttl;

    return this;
  }

  getStore(): Store {
    return this.store;
  }

  setStore(store: Store): Repo {
    this.store = store;

    return this;
  }

  protected itemKey(key: string): string {
    return this.store.getPrefix() + key;
  }

  protected getSeconds(ttl: any): number {
    return ttl;
  }

  private async value(value?: any): Promise<any> {
    return typeof value === 'function' ? await value() : value;
  }
}
