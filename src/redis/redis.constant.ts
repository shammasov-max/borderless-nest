import { Controller } from '@nestjs/common';
import { RedisService } from './redis.service';
import Redis from 'ioredis';

export const IORedisKey = 'IORedisKey';

export const redisProviderFactory = async () => {
    return new Redis({port: Number(process.env.REDIS_PORT), host:'127.0.0.1'}); 
}