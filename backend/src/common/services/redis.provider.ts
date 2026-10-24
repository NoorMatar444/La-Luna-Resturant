import { REDIS_CLIENT } from './redis.constant.js';
import { ConfigService } from '@nestjs/config';
import { Redis } from 'ioredis';
export const RedisProvider = {
  provide: REDIS_CLIENT,
  useFactory: (ConfigService: ConfigService) => {
    const redis = new Redis({
      host: ConfigService.getOrThrow<string>('REDIS_HOST'),
      port: Number(ConfigService.getOrThrow<string>('REDIS_PORT')),
      db: Number(ConfigService.getOrThrow<string>('REDIS_DB')),
      password: ConfigService.getOrThrow<string>('REDIS_PASSWORD'),
    });
    (redis.on('connect', () => {
      console.log('redis connected successfully');
    }),
      redis.on('error', () => {
        console.log('redis fail to connect');
      }));
      return redis;
  },
  inject: [ConfigService],
};
