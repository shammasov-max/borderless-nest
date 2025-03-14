import { Module } from '@nestjs/common';
import { HttpModule, HttpService } from '@nestjs/axios';
import { WagmiService } from './wagmi.service';
import { WagmiController } from './wagmi.controller';
import { RedisModule } from '../../redis/redis.module';
import {  RedisService } from '../../redis/redis.service';
import { IORedisKey, redisProviderFactory } from '../../redis/redis.constant';
import { ConfigService } from '@nestjs/config';

@Module({
  imports: [
    HttpModule
  ],
  controllers: [WagmiController],
  providers: [    {     
    provide: IORedisKey,
    useFactory: redisProviderFactory,
    inject: [ConfigService],
  },WagmiService, RedisService,],
  exports:[ HttpModule]

})
export class WagmiModule {}