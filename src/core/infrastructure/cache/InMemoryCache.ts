import { Cache as CacheContract } from '@/core/domain/cache/Cache';
import { Service } from '@/core/infrastructure/Container';

const DEFAULT_TTL_IN_SECONDS = 30; // seconds

type CacheRecord<T> = {
  data: T;
  expire: number;
}

@Service()
export class InMemoryCache implements CacheContract {
  protected readonly TTL: number;
  protected readonly store = new Map<string, CacheRecord<any>>();
  protected readonly timeoutRefs = new Map<string, NodeJS.Timeout>();

  constructor() {
    this.TTL = DEFAULT_TTL_IN_SECONDS;
  }

  async get<T>(key: string): Promise<T | null> {
    const now = Date.now();
    const record: CacheRecord<T> | undefined = this.store.get(key);

    const expiration = record?.expire ?? Infinity;

    if (!record || expiration < now) {
      return null;
    }

    return record.data;
  }

  async set<T>(key: string, data: T, ttl: number = this.TTL): Promise<void> {
    if (ttl === 0) {
      return;
    }

    const record: CacheRecord<T> = { data, expire: ttl * 1000 + Date.now() };

    const oldRecord = this.store.get(key);

    if (oldRecord) {
      clearTimeout(this.timeoutRefs.get(key));
      this.timeoutRefs.delete(key);
    }

    const ref = setTimeout(async () => {
      await this.invalidate(key);
    }, ttl * 1000);

    ref.unref();

    this.timeoutRefs.set(key, ref);
    this.store.set(key, record);
  }

  async invalidate(key: string): Promise<void> {
    let keys = [key];

    if (key.includes("*")) {
      const regExp = new RegExp(key.replace("*", ".*"));
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
  }

  async clear(): Promise<void> {
    this.timeoutRefs.forEach((ref) => clearTimeout(ref));
    this.timeoutRefs.clear();

    this.store.clear();
  }
}
