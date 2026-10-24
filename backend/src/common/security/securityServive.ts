import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { compare, hash } from 'bcrypt';
import { randomInt } from 'node:crypto';
import * as CryptoJS from 'crypto-js';

@Injectable()
export class SecurityService {
  constructor(private readonly configService: ConfigService) {}
  hashOperation({
    data,
    saltOrRounds = Number(
      this.configService.getOrThrow<string>('SALT_OR_ROUNDS'),
    ),
  }: {
    data: string | Buffer;
    saltOrRounds: string | number;
  }) {
    return hash(data, saltOrRounds);
  }
  compareOperation({
    data,
    encrypted = this.configService.getOrThrow<string>('ENCRYPTION_KEY'),
  }: {
    data: string | Buffer;
    encrypted: string;
  }) {
    return compare(data, encrypted);
  }
  encryptOperation({
    message,
    ENCRYPTION_KEY = this.configService.get<string>('ENCRYPTION_KEY') ?? '',
  }: {
    message: string | undefined;
    ENCRYPTION_KEY?: string;
  }) {
    return CryptoJS.AES.encrypt(message as string, ENCRYPTION_KEY).toString();
  }

  decryptOperation({
    message,
    ENCRYPTION_KEY = this.configService.get<string>('ENCRYPTION_KEY') ?? '',
  }: {
    message: string | undefined;
    ENCRYPTION_KEY?: string;
  }) {
    return CryptoJS.AES.decrypt(message as string, ENCRYPTION_KEY).toString(
      CryptoJS.enc.Utf8,
    );
  }

  generateOtp({ length = 6 }: { length?: number } = {}): string {
    if (length < 4 || length > 10) {
      throw new BadRequestException('OTP length must be between 4 and 10');
    }

    const min = 10 ** (length - 1);
    const max = 10 ** length;

    return randomInt(min, max).toString();
  }
}
