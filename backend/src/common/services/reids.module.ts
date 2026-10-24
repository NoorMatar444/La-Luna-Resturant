import { Module } from '@nestjs/common';
import { REDIS_CLIENT } from './redis.constant.js';
import { RedisProvider } from './redis.provider.js';
import { RedisService } from './redis.service.js';

@Module({
  providers: [RedisProvider, RedisService],
  exports: [REDIS_CLIENT, RedisService],
})
export class RedisModule {}
