import fs, { constants } from 'fs/promises';
import nodePath from 'path';
import { createHash } from 'crypto';
import { Store } from '@/core/domain/cache/Store';

class Hash {
  static make(text: string) {
    return createHash('sha256').update(text).digest('hex')
  }
}

class File {
  static async exists(path: string) {
    try {
      await fs.access(path, constants.F_OK);
    } catch (error) {
      return false;
    }
  }

  static async mkdir(path: string) {
    try {
      await fs.mkdir(path, { recursive: true });
      return true;
    } catch (error) {
      return false;
    }
  }

  static async read(path: string) {
    try {
      const value = await fs.readFile(path, 'utf-8');
      return value ? JSON.parse(value) : null;
    } catch (error) {
      return null;
    }
  }

  static async store(path: string, data: unknown) {
    try {
      const json = JSON.stringify(data);
      await fs.writeFile(path, json, 'utf-8');
      return true;
    } catch (error) {
      return false;
    }
  }

  static async delete(path: string) {
    try {
      await fs.unlink(path);
      return true;
    } catch (error) {
      return false;
    }
  }

  static async rm(path: string) {
    try {
      await fs.rm(path, { recursive: true, force: true });
      return true;
    } catch (error) {
      return false;
    }
  }
}

type CacheRecord<T> = {
  data: T;
  expire?: number;
}

export class FileStore implements Store {
  protected directory: string;

  constructor(directory: string) {
    this.directory = nodePath.resolve(directory);
  }

  async get<T>(key: string): Promise<T | null> {
    return await this.getPayload<T>(key);
  }

  async put(key: string, value: unknown, ttl: number): Promise<boolean> {
    const record: CacheRecord<any> = { data: value, expire: ttl * 1000 + Date.now() }

    try {
      const path = this.path(key);

      await this.ensureDirectoryExists(path);
      await File.store(path, record);

      return true;
    } catch (error) {
      return false;
    }
  }

  async forever(key: string, value: unknown): Promise<boolean> {
    const record: CacheRecord<any> = { data: value };
    try {
      const path = this.path(key);

      await this.ensureDirectoryExists(path);
      await File.store(path, record);

      return true;
    } catch (error) {
      return false;
    }
  }

  async forget(key: string): Promise<boolean> {
    try {
      const path = this.path(key);
      await File.delete(path);
      return true;
    } catch (error) {
      return false;
    }
  }

  async flush(): Promise<boolean> {
    try {
      await File.rm(this.directory);
      return true;
    } catch (error) {
      return false;
    }
  }

  getPrefix(): string {
    return '';
  }

  protected async getPayload<T>(key: string): Promise<T | null> {
    const path = this.path(key);

    let now = Date.now();
    let record: CacheRecord<T> | undefined = await File.read(path);

    const expiration = record?.expire ?? Infinity;

    if (!record || expiration < now) {
      await this.forget(key);
      return null;
    }

    return record.data;

  }

  protected path(key: string): string {
    const hash = Hash.make(key);
    const parts = hash.match(/.{2}/g)!.slice(0, 2);

    return nodePath.join(this.directory, ...parts, hash);
  }

  protected async ensureDirectoryExists(path: string): Promise<void> {
    const directory = nodePath.dirname(path);

    if (!await File.exists(directory)) {
      await File.mkdir(directory);
    }
  }
}
