import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class SubgraphProxyService {
  constructor(private readonly httpService: HttpService) {}



  public async fetchSubgraph(url: string, body: any): Promise<any> {
    try {
      const response = await this.httpService.axiosRef.post(url, body, {
        // headers: { ... }
      });
      return response.data;
    } catch (error) {
      console.error(error);
      throw new HttpException('Error calling subgraph '+url, HttpStatus.BAD_REQUEST);
    }
  }

}
