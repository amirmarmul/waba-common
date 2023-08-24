import { randomBytes, scryptSync } from 'crypto';

export class Hash {
  static make = (password: string): string => {
    const salt = randomBytes(16).toString('hex');
    return Hash.encryptPassword(password, salt) + salt;
  };

  static compare = (password: string, hash: string): Boolean => {
    const salt = hash.slice(64);
    const originalPassHash = hash.slice(0, 64);
    const currentPassHash = Hash.encryptPassword(password, salt);
    return originalPassHash === currentPassHash;
  };

  private static encryptPassword = (password: string, salt: string) => {
    return scryptSync(password, salt, 32).toString('hex');
  };
}