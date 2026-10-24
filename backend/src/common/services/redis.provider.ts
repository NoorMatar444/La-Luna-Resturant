import { REDIS_CLIENT } from './redis.constant.js';
import { ConfigService } from '@nestjs/config';
import { Redis } from 'ioredis';
export const RedisProvider = {
  provide: REDIS_CLIENT,
  useFactory: (ConfigService: ConfigService) => {
    // Hosted Redis (Upstash) gives one rediss:// URL. Local Docker uses host and port.
    const url = ConfigService.get<string>('REDIS_URL');
    const redis = url
      ? new Redis(url)
      : new Redis({
          host: ConfigService.getOrThrow<string>('REDIS_HOST'),
          port: Number(ConfigService.getOrThrow<string>('REDIS_PORT')),
          db: Number(ConfigService.get<string>('REDIS_DB') ?? 0),
          password: ConfigService.get<string>('REDIS_PASSWORD') || undefined,
        });
    redis.on('connect', () => {
      console.log('redis connected successfully');
    });
    redis.on('error', () => {
      console.log('redis fail to connect');
    });
    return redis;
  },
  inject: [ConfigService],
};
