import { Store } from '@/core/domain/cache/Store';

export interface Repo {
  /**
   * Determine if an item exists in the cache.
   */
  has(key: string): Promise<boolean>;
  /**
   * Determine if an item doesn't exist in the cache.
   */
  missing(key: string): Promise<boolean>;
  /**
   * Retrieve an item from the cache by key.
   */
  get<T>(key: string, _default?: unknown): Promise<T | null>;
  /**
   * Retrieve an item from the cache and delete it.
   */
  pull<T>(key: string, _default?: unknown): Promise<T | null>;
  /**
   * Store an item in the cache.
   */
  put(key: string, value: unknown, ttl?: number): Promise<boolean>;
  /**
   * Store an item in the cache if the key does not exist.
   */
  add(key: string, value: unknown, ttl?: number): Promise<boolean>;
  /**
   * Store an item in the cache indefinitely.
   */
  forever(key: string, value: unknown): Promise<boolean>;
  /**
   * Get an item from the cache, or execute the given Closure and store the result.
   */
  remember<T>(key: string, callback: Function, ttl?: number): Promise<T>;
  /**
   * Get an item from the cache, or execute the given Closure and store the result forever.
   */
  rememberForever<T>(key: string, callback: Function): Promise<T>;
  /**
   * Remove an item from the cache.
   */
  forget(key: string): Promise<boolean>;
  /**
   * Remove all items from the cache.
   */
  flush(): Promise<boolean>;
  /**
   * Get the cache store implementation.
   */
  getStore(): Store;
}
