import { Store } from '@/core/domain/cache/Store';

type CacheRecord<T> = {
  data: T;
  expire?: number;
}

export class ArrayStore implements Store {
  protected readonly store = new Map<string, CacheRecord<any>>();
  protected readonly timeoutRefs = new Map<string, NodeJS.Timeout>();

  async get<T>(key: string): Promise<T | null> {
    const now = Date.now();

    const record: CacheRecord<T> | undefined = this.store.get(key);

    const expiration = record?.expire ?? Infinity;

    if (!record || expiration < now) {
      return null;
    }

    return record.data;
  }

  async put(key: string, value: unknown, ttl: number): Promise<boolean> {
    const record: CacheRecord<any> = { data: value, expire: ttl * 1000 + Date.now() }

    const oldRecord = this.store.get(key);

    if (oldRecord) {
      await this.forget(key);
    }

    const ref = setTimeout(async () => {
      await this.forget(key);
    }, ttl * 1000);

    ref.unref();

    this.timeoutRefs.set(key, ref);
    this.store.set(key, record);

    return true;
  }

  async forever(key: string, value: unknown): Promise<boolean> {
    const record: CacheRecord<any> = { data: value }

    const oldRecord = this.store.get(key);

    if (oldRecord) {
      await this.forget(key);
    }

    this.store.set(key, record);

    return true;
  }

  async forget(key: string): Promise<boolean> {
    let keys = [key];

    if (key.includes('*')) {
      const regExp = new RegExp(key.replace('*', '.*'));
      keys = Array.from(this.store.keys()).filter((k) => k.match(regExp));
    }

    keys.forEach((key) => {
      const timeoutRef = this.timeoutRefs.get(key);
      if (timeoutRef) {
        clearTimeout(timeoutRef);
        this.timeoutRefs.delete(key);
      }
      this.store.delete(key);
    });

    return true;
  }

  async flush(): Promise<boolean> {
    this.timeoutRefs.forEach((ref) => clearTimeout(ref));
    this.timeoutRefs.clear();

    this.store.clear();

    return true;
  }

  getPrefix(): string {
    return '';
  }
}
