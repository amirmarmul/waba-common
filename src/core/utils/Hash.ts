import crypto from 'crypto';

export class Hash {
  static make(text: string) {
    return crypto.createHash('sha256').update(text).digest('base64');
  }

  static compare(text: string, hashed: string): boolean {
    return Object.is(Hash.make(text), hashed);
  }
}
