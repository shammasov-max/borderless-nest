import { HttpService } from '@nestjs/axios';
export declare class SubgraphProxyService {
    private readonly httpService;
    constructor(httpService: HttpService);
    fetchSubgraph(url: string, body: any): Promise<any>;
}
