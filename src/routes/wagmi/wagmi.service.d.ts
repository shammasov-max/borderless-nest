import { HttpService } from '@nestjs/axios';
import { RedisService } from '../../redis/redis.service';
export declare class WagmiService {
    private readonly httpService;
    private readonly redisService;
    constructor(httpService: HttpService, redisService: RedisService);
    fetchData(chain: string, params: any): Promise<any>;
    callRPC(chain: string, body: any): Promise<any>;
}
