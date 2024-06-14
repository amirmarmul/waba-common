import { Store } from '@/core/domain/cache/Store';

export class NullStore implements Store {

  async get<T>(key: string): Promise<T | null> {
    return null;
  }

  async put(key: string, value: any, ttl: number): Promise<boolean> {
    return false;
  }

  async forever(key: string, value: unknown): Promise<boolean> {
    return false;
  }

  async forget(key: string): Promise<boolean> {
    return false;
  }

  async flush(): Promise<boolean> {
    return false;
  }

  getPrefix(): string {
    return '';
  }
}
