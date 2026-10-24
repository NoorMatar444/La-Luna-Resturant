import { Inject, Injectable } from '@nestjs/common';
import { REDIS_CLIENT } from './redis.constant.js';
import { Redis, RedisKey } from 'ioredis';

@Injectable()
export class RedisService {
  constructor(@Inject(REDIS_CLIENT) private readonly redis: Redis) {}
  async set({
    key,
    value,
  }: {
    key: RedisKey;
    value: string | Buffer | number;
  }) {
    return this.redis.set(key, value);
  }
  async get({ key }: { key: RedisKey }) {
    return this.redis.get(key);
  }
  async delete({ key }: { key: RedisKey }) {
    return this.redis.del(key);
  }
  async exists({ key }: { key: RedisKey }) {
    return this.redis.exists(key);
  }
  async expire({ key, seconds }: { key: RedisKey; seconds: number | string }) {
    return this.redis.expire(key, seconds);
  }
}
