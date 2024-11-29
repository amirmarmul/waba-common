import {
  createHash,
  randomBytes,
  createCipheriv,
  createDecipheriv,
} from "crypto";

export enum CryptoAlgorithm {
  AES256CTR = "aes-256-ctr",
  AES256GCM = "aes-256-gcm",
}

enum CryptoError {
  UNKNOWN_ALGORITHM = "Unknown algorithm.",
  INVALID_ENCRYPTED_FORMAT = "Invalid encrypted data format.",
}

export class Crypto {
  static secretKey = process.env.SECRET_KEY ?? "this-is-secret-key";

  /**
   * Make a encrypted text using key process.env.SECRET_KEY with the spesific algorithm.
   * Please see CryptoAlgorithm enum for supported algorithm
   * @param plain string
   * @param algorithm CryptoAlgorithm
   * @returns string
   */
  static encrypt = (
    plain: string,
    algorithm: string = CryptoAlgorithm.AES256CTR
  ): string => {
    if (algorithm == CryptoAlgorithm.AES256CTR) {
      const key = createHash("sha256").update(Crypto.secretKey).digest();
      const nonce = randomBytes(16);
      const cipher = createCipheriv("aes-256-ctr", key, nonce);
      let encrypted = cipher.update(plain, "utf8", "hex");
      encrypted += cipher.final("hex");
      return nonce.toString("hex") + ":" + encrypted;
    }

    if (algorithm == CryptoAlgorithm.AES256GCM) {
      const keyBuffer = createHash("sha256").update(this.secretKey).digest();
      const iv = randomBytes(12); // 96-bit IV for AES-GCM
      const cipher = createCipheriv("aes-256-gcm", keyBuffer, iv);
      let encrypted = cipher.update(plain, "utf8", "hex");
      encrypted += cipher.final("hex");
      const tag = cipher.getAuthTag();
      return `${iv.toString("hex")}-${tag.toString("hex")}-${encrypted}`;
    }

    throw new Error(CryptoError.UNKNOWN_ALGORITHM);
  };

  /**
   * Decrypt the chipper message using key process.env.SECRET_KEY with the spesific algorithm.
   * Please see CryptoAlgorithm enum for supported algorithm
   * @param cryptedMessage string
   * @param algorithm CryptoAlgorithm
   * @returns string
   */
  static decrypt = (
    cryptedMessage: string,
    algorithm: string = CryptoAlgorithm.AES256CTR
  ): string => {
    if (algorithm == CryptoAlgorithm.AES256CTR) {
      const parts = cryptedMessage.split(":");
      if (parts.length !== 2)
        throw new Error(CryptoError.INVALID_ENCRYPTED_FORMAT);
      const nonce = Buffer.from(parts[0], "hex");
      const content = parts[1];
      const key = createHash("sha256").update(Crypto.secretKey).digest();
      const decipher = createDecipheriv("aes-256-ctr", key, nonce);
      let decrypted = decipher.update(content, "hex", "utf8");
      decrypted += decipher.final("utf8");
      return decrypted;
    }

    if (algorithm == CryptoAlgorithm.AES256GCM) {
      const keyBuffer = createHash("sha256").update(this.secretKey).digest();
      const parts = cryptedMessage.split("-");
      if (parts.length !== 3)
        throw new Error(CryptoError.INVALID_ENCRYPTED_FORMAT);
      const decipher = createDecipheriv(
        "aes-256-gcm",
        keyBuffer,
        Buffer.from(parts[0], "hex")
      );
      decipher.setAuthTag(Buffer.from(parts[1], "hex"));
      let decrypted = decipher.update(parts[2], "hex", "utf8");
      decrypted += decipher.final("utf8");
      return decrypted;
    }

    throw new Error(CryptoError.UNKNOWN_ALGORITHM);
  };
}
