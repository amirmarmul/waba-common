import { createHash, randomBytes, createCipheriv, createDecipheriv } from 'crypto';

/**
 * let campaignData = { successTemplate: 'success-tmpl', failedTemplate: 'failed-tmpl', senderId: 'this-is-sender-id', validOutlets: ['asd', 'qwe'] };
 * ley payload = JSON.stringify(campaignData);
 * let hash = Crypto.encrypt(payload);
 *
 * let decodedString = Crypto.decrypt(hash);
 * let decoded = JSON.parse(decodedString);
 */
export class Crypto {
  static secretKey = process.env.SECRET_KEY ?? 'this-is-secret-key';

  static encrypt = (text: string): string => {
    const key = createHash('sha256').update(Crypto.secretKey).digest();
    const nonce = randomBytes(16);
    const cipher = createCipheriv('aes-256-ctr', key, nonce);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return nonce.toString('hex') + ':' + encrypted;
  }

  static decrypt = (hash: string): string => {
    const parts = hash.split(':');
    if (parts.length !== 2) throw new Error("Invalid encrypted data format.");

    const nonce = Buffer.from(parts[0], 'hex');
    const content = parts[1];
    const key = createHash('sha256').update(Crypto.secretKey).digest();
    const decipher = createDecipheriv('aes-256-ctr', key, nonce);
    let decrypted = decipher.update(content, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  }
}
