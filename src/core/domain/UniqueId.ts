import { randomUUID as uuid } from 'node:crypto';
import { Identifier } from '@/core/domain/Identifier';

export class UniqueId extends Identifier<string> {
  constructor(id?: string) {
    super(id ?? uuid());
  }
}
