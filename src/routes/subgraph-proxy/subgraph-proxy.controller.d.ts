import { HttpService } from '@nestjs/axios';
export declare class SubgraphProxyController {
    private readonly httpService;
    constructor(httpService: HttpService);
    fetchSubgraph(url: string, body: any): Promise<any>;
    subgraph(body: any): Promise<any>;
    subgraph1(body: any): Promise<any>;
    subgraph2(body: any): Promise<any>;
    subgraph3(body: any): Promise<any>;
}
