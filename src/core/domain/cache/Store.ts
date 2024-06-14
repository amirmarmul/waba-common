export interface Store {
  /**
   *  Fetches a value from the cache.
   */
  get<T>(key: string): Promise<T | null>;
  /**
   * Store an item in the cache for a given number of seconds.
   */
  put(key: string, value: unknown, ttl: number): Promise<boolean>;
  /**
   * Store an item in the cache indefinitely.
   */
  forever(key: string, value: unknown): Promise<boolean>;
  /**
   * Remove an item from the cache.
   */
  forget(key: string): Promise<boolean>;
  /**
   * Remove all items from the cache.
   */
  flush(): Promise<boolean>;
  /**
   * Get the cache key prefix.
   */
  getPrefix(): string;
}
