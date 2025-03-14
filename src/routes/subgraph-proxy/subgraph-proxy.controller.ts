import { Controller, Post, Body, HttpException, HttpStatus } from '@nestjs/common';
import { SubgraphProxyService } from './subgraph-proxy.service';
import { HttpService } from '@nestjs/axios';

import { firstValueFrom } from 'rxjs';

@Controller('api/test')
export class SubgraphProxyController {
  constructor(private readonly httpService: HttpService) {}
  public async fetchSubgraph(url: string, body: any): Promise<any> {
    try {
      const response =await this.httpService.axiosRef.post(url, body, {});
      return response.data;
    } catch (error) {
      console.error(error);
      throw new HttpException('Error calling subgraph '+url, HttpStatus.BAD_REQUEST);
    }
  }

  @Post('subgraph')
  async subgraph(@Body() body: any) {
    return this.fetchSubgraph("https://api.studio.thegraph.com/query/26374/nap-graph/version/latest", body);
  }
  
  @Post('subgraph1')
  async subgraph1(@Body() body: any) {
    return this.fetchSubgraph('https://api.studio.thegraph.com/query/26374/bcp-staking-graph/version/latest',body);
  }

  @Post('subgraph2')
  async subgraph2(@Body() body: any) {
    return this.fetchSubgraph('https://api.studio.thegraph.com/query/26374/nap-factory-graph/version/latest',body);
  }

  @Post('subgraph3')
  async subgraph3(@Body() body: any) {
    return this.fetchSubgraph('https://api.studio.thegraph.com/query/26374/nap-factory-base/version/latest', body);
  }
 

}
