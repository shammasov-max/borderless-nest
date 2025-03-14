import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class SubgraphProxyService {
  constructor(private readonly httpService: HttpService) {}


  /**
   * Пример логики, аналогичной router.post("/api/test/subgraph2").
   * Делает POST-запрос на "https://api.studio.thegraph.com/query/..."
   */
  public async fetchSubgraph(url: string, body: any): Promise<any> {
    try {
      // Отправляем запрос, используя HttpService (обёртка над axios)
      const response$ = this.httpService.post(url, body, {
        // при необходимости можно прокинуть дополнительные заголовки, например:
        // headers: { ... }
      });

      // firstValueFrom() преобразует Observable (response$) в Promise
      const response = await firstValueFrom(response$);
      return response.data;
    } catch (error) {
      console.error(error);
      throw new HttpException('Error calling subgraph '+url, HttpStatus.BAD_REQUEST);
    }
  }

}
