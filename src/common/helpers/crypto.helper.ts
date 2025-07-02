import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';

@Injectable()
export class CryptoHelper {
  private readonly keyBase64: string;
  private readonly key: Buffer;
  private readonly algorithm: string = 'aes-256-ctr';
  private readonly logger: Logger = new Logger(CryptoHelper.name);

  constructor(private readonly configService: ConfigService) {
    this.keyBase64 = this.configService.get<string>('AES_SECRET_KEY') || '';

    if (!this.keyBase64) {
      throw new Error('AES_SECRET_KEY not found');
    }

    this.logger.log(`AES_SECRET_KEY: ${this.keyBase64}`);
    this.key = Buffer.from(this.keyBase64, 'base64');
  }

  public encrypt = (
    plainText: string,
  ): { iv: string; encryptedText: string } => {
    const iv: Buffer = crypto.randomBytes(16);
    const cipher: crypto.Cipher = crypto.createCipheriv(
      this.algorithm,
      this.key,
      iv,
    );
    const encrypted = Buffer.concat([cipher.update(plainText), cipher.final()]);

    this.logger.log(`Encrypted text: ${encrypted.toString('hex')}`);
    return {
      iv: iv.toString('hex'),
      encryptedText: encrypted.toString('hex'),
    };
  };

  public decrypt = (ivHex: string, encryptedHex: string): string => {
    const iv = Buffer.from(ivHex, 'hex');
    const encryptedText = Buffer.from(encryptedHex, 'hex');
    const decipher = crypto.createDecipheriv(this.algorithm, this.key, iv);
    const decrypted = Buffer.concat([
      decipher.update(encryptedText),
      decipher.final(),
    ]);
    this.logger.log(`Decrypted text: ${decrypted.toString()}`);
    return decrypted.toString();
  };

  public hash = (text: string): string =>
    crypto.createHash('sha256').update(text).digest('hex');
}
