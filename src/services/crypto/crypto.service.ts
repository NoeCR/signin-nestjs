
import { Injectable } from '@nestjs/common';
import { createCipheriv, createDecipheriv, scrypt } from 'crypto';
import { promisify } from 'util';
import { EConfiguration } from 'src/config/enum/config-keys.enum';
import { ConfigService } from 'src/config/services/config.service';

@Injectable()
export class CryptoService {
  private algorithm: string;
  private salt: string;
  private iv: string;

  constructor(private readonly _configService: ConfigService) {
    this.algorithm = this._configService.get(EConfiguration.CRYPTO_ALGORITHM)
    this.salt = this._configService.get(EConfiguration.CRYPTO_PASSWORD)
    this.iv = this._configService.get(EConfiguration.CRYPTO_IV)
  }

  async cipher(text: string): Promise<string> {
    try {
      const key = (await promisify(scrypt)(this.salt, 'salt', 32)) as Buffer;

      const cipher = createCipheriv(this.algorithm, key, this.iv);

      return `${cipher.update(text, 'utf8', 'hex')}${cipher.final('hex')}`;
    }
    catch (error) {
      console.log(error);
    }
  }

  async decrypt(text: string): Promise<string> {
    try {
      const key = (await promisify(scrypt)(this.salt, 'salt', 32)) as Buffer;

      const decipher = createDecipheriv(this.algorithm, key, this.iv);

      const decryptedText = Buffer.concat([
        decipher.update(Buffer.from(text, 'hex')),
        decipher.final(),
      ]);

      return decryptedText.toString();
    }
    catch (error) {
      console.log(error);
    }
  }
}
