import { randomBytes, scryptSync } from 'crypto';

export class Hash {
  static make = (text: string): string => {
    const salt = randomBytes(16).toString('hex');
    return Hash.encrypt(text, salt) + salt;
  };

  static compare = (text: string, hash: string): boolean => {
    const salt = hash.slice(64);
    const originalTextHash = hash.slice(0, 64);
    const currentTextHash = Hash.encrypt(text, salt);
    return originalTextHash === currentTextHash;
  };

  private static encrypt = (text: string, salt: string) => {
    return scryptSync(text, salt, 32).toString('hex');
  };
}
