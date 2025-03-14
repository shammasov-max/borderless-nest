import { Global, Module, OnApplicationShutdown, Scope } from '@nestjs/common';

import { ConfigModule, ConfigService } from '@nestjs/config';
import { IORedisKey, redisProviderFactory } from './redis.constant';
import Redis from 'ioredis';
import { ModuleRef } from '@nestjs/core';
import {  RedisService } from './redis.service';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [
    {     
      provide: IORedisKey,
      useFactory:redisProviderFactory,
      inject: [ConfigService],
    },
    RedisService,
  ]
})
export class RedisModule implements OnApplicationShutdown {
  constructor(private readonly moduleRef: ModuleRef) {}

  async onApplicationShutdown(signal?: string): Promise<void> {
    return new Promise<void>((resolve) => {
      const redis = this.moduleRef.get(IORedisKey);
      redis.quit();
      redis.on('end', () => {
        resolve();
      });
    });
  }
}