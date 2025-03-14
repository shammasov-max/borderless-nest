import { Redis } from 'ioredis';
export declare class RedisService {
    redisClient: Redis;
    constructor(redisClient: Redis);
    getKeys(pattern?: string | undefined): Promise<string[]>;
    set(key: string, value: string | number, expireInSeconds?: number): Promise<void>;
    call(...args: Parameters<Redis['call']>): ReturnType<Redis['call']>;
    get(key: string): Promise<string | null>;
    delete(key: string): Promise<void>;
    clear(): Promise<number>;
    validate(key: string, value: string): Promise<boolean>;
}
