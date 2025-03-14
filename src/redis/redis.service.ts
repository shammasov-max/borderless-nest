import { Inject, Injectable } from '@nestjs/common';
import { Redis } from 'ioredis';
import { IORedisKey } from './redis.constant';

// Đến giờ vẫn chưa hiểu có những chỗ dùng @decorator inject, có những chỗ thì không dùng ? Tại sao vậy!
@Injectable()
export class RedisService {
  constructor(
    @Inject(IORedisKey)
    public redisClient: Redis,
  ) {
  }

  async getKeys(pattern: string | undefined = '*'): Promise<string[]> {
    return await this.redisClient.keys("PATTERN:"+pattern);
  }

  async set(
    key: string,
    value: string | number,
    expireInSeconds?: number,
  ): Promise<void> {
    if (expireInSeconds) {
      await this.redisClient.set(key, value, 'EX', expireInSeconds);
    } else {
      await this.redisClient.set(key, value);
      console.log(
        'this.redisClient.set(key, value)',
        await this.redisClient.set(key, value),
      );
    }
  }
  async call(...args: Parameters<Redis['call']>) : ReturnType<Redis['call']> {
    console.log('CALL , ' , args.join())
    return await this.redisClient.call(...args)
  }

  async get(key: string) {
    return await this.redisClient.get(key);

  }

  async delete(key: string): Promise<void> {
    await this.redisClient.del(key);
  }

  async clear() {
    const keys = await this.redisClient.keys('PATTERN:*');
    if(keys.length) 
      return await this.redisClient.del(keys);
    return 0;
  }


  async validate(key: string, value: string): Promise<boolean> {
    const storedValue = await this.redisClient.get(key);
    return storedValue === value;
  }
}