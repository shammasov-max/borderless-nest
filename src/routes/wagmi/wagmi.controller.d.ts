import { WagmiService } from './wagmi.service';
export declare class WagmiController {
    private readonly wagmiService;
    constructor(wagmiService: WagmiService);
    callRPC(chain: string, body: any): Promise<any>;
    getData(chain: string, query: any): Promise<any>;
}
